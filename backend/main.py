import io
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse, Response
from typing import List
from . import crud, models, schemas, gemini_analyzer
from .database import AsyncSessionLocal, engine, Base

app = FastAPI()
ALERT_THRESHOLD = 7

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# This function now contains the final validation logic
async def process_analysis(analysis_id: int):
    async with AsyncSessionLocal() as db:
        db_analysis = await crud.get_analysis(db, analysis_id)
        if not db_analysis: return
        try:
            # Step 1: Get the analysis from the AI
            result = await gemini_analyzer.get_analysis_from_gemini(db_analysis.ticket_text)

            # Step 2: NEW VALIDATION - Check the AI's own conclusion
            # If the AI determined the text was irrelevant, we'll consider it a failure.
            if result.topic.lower() == 'irrelevant':
                raise ValueError("Input is nonsensical or irrelevant and cannot be analyzed.")

            # Step 3: If validation passes, save the successful result
            await crud.update_analysis_result(db, analysis_id, result)
        except Exception as e:
            # All errors (including our new validation error) are caught here and marked as FAILED
            await crud.update_analysis_error(db, analysis_id, str(e))

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db

@app.get("/api/analyses/", response_model=List[schemas.AnalysisResponse])
async def get_analyses_history(db: AsyncSession = Depends(get_db)):
    analyses = await crud.get_all_analyses(db)
    response_data = []
    for analysis in analyses:
        item = {"id": analysis.id, "status": analysis.status, "ticket_text": analysis.ticket_text, "created_at": analysis.created_at, "error_message": analysis.error_message, "result": None}
        if analysis.status == "COMPLETE":
            item["result"] = {"emotion": analysis.emotion, "summary": analysis.summary, "topic": analysis.topic, "urgency_score": analysis.urgency_score}
        response_data.append(item)
    return response_data

@app.delete("/api/analyses/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_history(db: AsyncSession = Depends(get_db)):
    await crud.delete_all_analyses(db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.delete("/api/analyses/alerts", status_code=status.HTTP_204_NO_CONTENT)
async def clear_alerts(db: AsyncSession = Depends(get_db)):
    await crud.delete_alerts(db, urgency_threshold=ALERT_THRESHOLD)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.delete("/api/analysis/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(analysis_id: int, db: AsyncSession = Depends(get_db)):
    result = await crud.delete_analysis_by_id(db, analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.get("/api/analyses/download-all")
async def download_all_analyses(db: AsyncSession = Depends(get_db)):
    all_analyses = await crud.get_all_analyses(db)
    completed_analyses = [a for a in all_analyses if a.status == "COMPLETE"]
    if not completed_analyses:
        raise HTTPException(status_code=404, detail="No completed analyses to download.")
    full_report = "SentiMind AI - Full Analysis History Report\n=============================================\n\n"
    for analysis in completed_analyses:
        full_report += (f"--- Analysis ID: {analysis.id} ---\n"
                       f"Timestamp: {analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
                       f"Original Ticket: \"{analysis.ticket_text}\"\n"
                       f"Emotion: {analysis.emotion}\n"
                       f"Topic: {analysis.topic}\n"
                       f"Urgency: {analysis.urgency_score}/10\n"
                       f"Summary: {analysis.summary}\n\n")
    return StreamingResponse(iter([full_report.encode('utf-8')]), media_type="text/plain", headers={"Content-Disposition": "attachment; filename=full_analysis_history.txt"})

@app.get("/api/analyses/download-alerts")
async def download_all_alerts(db: AsyncSession = Depends(get_db)):
    all_analyses = await crud.get_all_analyses(db)
    alerts = [a for a in all_analyses if a.status == "COMPLETE" and a.urgency_score >= ALERT_THRESHOLD]
    if not alerts:
        raise HTTPException(status_code=404, detail="No alerts available to download.")
    
    alert_report = "SentiMind AI - High-Urgency Alerts Report\n=============================================\n\n"
    for analysis in alerts:
        alert_report += (f"--- Analysis ID: {analysis.id} ---\n"
                         f"Timestamp: {analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
                         f"Original Ticket: \"{analysis.ticket_text}\"\n"
                         f"Emotion: {analysis.emotion}\n"
                         f"Topic: {analysis.topic}\n"
                         f"Urgency: {analysis.urgency_score}/10\n"
                         f"Summary: {analysis.summary}\n\n")
    return StreamingResponse(iter([alert_report.encode('utf-8')]), media_type="text/plain", headers={"Content-Disposition": "attachment; filename=high_urgency_alerts.txt"})

@app.post("/api/analyze-text", status_code=202)
async def submit_text_analysis(req: schemas.TicketRequest, bg: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    pa = await crud.create_pending_analysis(db, ticket_text=req.text)
    bg.add_task(process_analysis, pa.id)
    return {"message": "Analysis started", "analysis_id": pa.id}

@app.post("/api/analyze-file", status_code=202)
async def submit_file_analysis(bg: BackgroundTasks, db: AsyncSession = Depends(get_db), file: UploadFile = File(...)):
    contents = await file.read()
    try: text_data = contents.decode('utf-8')
    except UnicodeDecodeError: raise HTTPException(status_code=400, detail="Invalid file encoding. Please use UTF-8.")
    
    feedback_lines = [line.strip() for line in text_data.splitlines() if line.strip()]

    if not feedback_lines:
        raise HTTPException(status_code=400, detail="The uploaded file is empty or contains no valid text.")

    analysis_ids = []
    for line in feedback_lines:
        pending_analysis = await crud.create_pending_analysis(db, ticket_text=line)
        bg.add_task(process_analysis, pending_analysis.id)
        analysis_ids.append(pending_analysis.id)
    
    return {"message": f"Started analysis for {len(feedback_lines)} tickets.", "analysis_ids": analysis_ids}

@app.get("/api/analysis/{analysis_id}/download")
async def download_analysis_result(analysis_id: int, db: AsyncSession = Depends(get_db)):
    db_analysis = await crud.get_analysis(db, analysis_id)
    if not db_analysis or db_analysis.status != "COMPLETE":
        raise HTTPException(status_code=404, detail="Analysis not found or not complete.")
    content = (f"Analysis Report for Ticket ID: {db_analysis.id}\n"
               f"=================================================\n"
               f"Timestamp: {db_analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
               f"Original Ticket:\n\"{db_analysis.ticket_text}\"\n\n"
               f"Analysis Results:\n"
               f"-----------------\n"
               f"  - Emotion: {db_analysis.emotion}\n"
               f"  - Topic: {db_analysis.topic}\n"
               f"  - Urgency Score: {db_analysis.urgency_score}/10\n"
               f"  - Summary: {db_analysis.summary}\n")
    return StreamingResponse(iter([content.encode('utf-8')]), media_type="text/plain", headers={"Content-Disposition": f"attachment; filename=analysis-{analysis_id}.txt"})
