import io
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse, Response
from typing import List
from . import crud, models, schemas, gemini_analyzer
from .database import AsyncSessionLocal, engine, Base

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def process_analysis(analysis_id: int):
    async with AsyncSessionLocal() as db:
        db_analysis = await crud.get_analysis(db, analysis_id)
        if not db_analysis: return
        try:
            result = await gemini_analyzer.get_analysis_from_gemini(db_analysis.ticket_text)
            await crud.update_analysis_result(db, analysis_id, result)
        except Exception as e:
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

# NEW: Endpoint to download all completed analyses
@app.get("/api/analyses/download-all")
async def download_all_analyses(db: AsyncSession = Depends(get_db)):
    all_analyses = await crud.get_all_analyses(db)
    completed_analyses = [a for a in all_analyses if a.status == "COMPLETE"]

    if not completed_analyses:
        raise HTTPException(status_code=404, detail="No completed analyses available to download.")

    full_report = "SentiMind AI - Full Analysis History Report\n"
    full_report += "=============================================\n\n"

    for analysis in completed_analyses:
        full_report += (
            f"--- Analysis ID: {analysis.id} ---\n"
            f"Timestamp: {analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"Original Ticket: \"{analysis.ticket_text}\"\n"
            f"Emotion: {analysis.emotion}\n"
            f"Topic: {analysis.topic}\n"

            f"Urgency: {analysis.urgency_score}/10\n"
            f"Summary: {analysis.summary}\n\n"
        )
    
    return StreamingResponse(
        iter([full_report.encode('utf-8')]),
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=full_analysis_history.txt"}
    )

@app.post("/api/analyze-text", status_code=202)
async def submit_text_analysis(req: schemas.TicketRequest, bg: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    pa = await crud.create_pending_analysis(db, ticket_text=req.text)
    bg.add_task(process_analysis, pa.id)
    return {"message": "Analysis started", "analysis_id": pa.id}

@app.post("/api/analyze-file", status_code=202)
async def submit_file_analysis(bg: BackgroundTasks, db: AsyncSession = Depends(get_db), file: UploadFile = File(...)):
    contents = await file.read()
    try:
        text_data = contents.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding. Please use UTF-8.")
    
    all_lines = text_data.splitlines()
    feedback_lines = []
    is_original_ticket_section = False
    for line in all_lines:
        stripped_line = line.strip()
        if stripped_line == "Original Ticket:":
            is_original_ticket_section = True
            continue
        if stripped_line == "Analysis Results:":
            is_original_ticket_section = False
            continue
        if is_original_ticket_section and stripped_line:
             feedback_lines.append(stripped_line.strip('"'))
    
    if not feedback_lines:
        feedback_lines = [line for line in all_lines if line.strip()]

    if not feedback_lines:
        raise HTTPException(status_code=400, detail="File is empty or contains no valid feedback lines.")

    analysis_ids = []
    for line in feedback_lines:
        pa = await crud.create_pending_analysis(db, ticket_text=line)
        bg.add_task(process_analysis, pa.id)
        analysis_ids.append(pa.id)
    
    return {"message": f"Started analysis for {len(feedback_lines)} tickets.", "analysis_ids": analysis_ids}

@app.get("/api/analysis/{analysis_id}/download")
async def download_analysis_result(analysis_id: int, db: AsyncSession = Depends(get_db)):
    db_analysis = await crud.get_analysis(db, analysis_id)
    if not db_analysis or db_analysis.status != "COMPLETE":
        raise HTTPException(status_code=404, detail="Analysis not found or not complete.")

    content = (
        f"Analysis Report for Ticket ID: {db_analysis.id}\n"
        f"=================================================\n"
        f"Timestamp: {db_analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        f"Original Ticket:\n\"{db_analysis.ticket_text}\"\n\n"
        f"Analysis Results:\n"
        f"-----------------\n"
        f"  - Emotion: {db_analysis.emotion}\n"
        f"  - Topic: {db_analysis.topic}\n"
        f"  - Urgency Score: {db_analysis.urgency_score}/10\n"
        f"  - Summary: {db_analysis.summary}\n"
    )
    
    return StreamingResponse(
        iter([content.encode('utf-8')]),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=analysis-{analysis_id}.txt"}
    )
