# backend/main.py
import asyncio
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from . import crud, models, schemas, gemini_analyzer
from .database import AsyncSessionLocal, engine

app = FastAPI()

# --- Background Task Processor ---
async def process_analysis(analysis_id: int, text: str):
    """This function runs in the background"""
    async with AsyncSessionLocal() as db:
        try:
            # 1. Call Gemini
            result = await gemini_analyzer.get_analysis_from_gemini(text)
            # 2. Update DB with result
            await crud.update_analysis_result(db, analysis_id, result)
        except Exception as e:
            # 3. Or update DB with error
            await crud.update_analysis_error(db, analysis_id, str(e))

# --- Dependency for DB Session ---
async def get_db():
    async with AsyncSessionLocal() as db:
        yield db

# --- API Endpoints ---
@app.post("/api/analyze", status_code=202)
async def submit_analysis(
    request: schemas.TicketRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Accepts a ticket, immediately returns a task ID,
    and starts the analysis in the background.
    """
    pending_analysis = await crud.create_pending_analysis(db)
    background_tasks.add_task(process_analysis, pending_analysis.id, request.text)
    return {"message": "Analysis started", "analysis_id": pending_analysis.id}


@app.get("/api/analysis/{analysis_id}", response_model=schemas.AnalysisStatusResponse)
async def get_analysis_status(analysis_id: int, db: AsyncSession = Depends(get_db)):
    """
    Allows the frontend to poll for the analysis result.
    """
    db_analysis = await crud.get_analysis(db, analysis_id)
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    response = {"id": db_analysis.id, "status": db_analysis.status}
    if db_analysis.status == "COMPLETE":
        response["result"] = {
            "emotion": db_analysis.emotion,
            "summary": db_analysis.summary,
            "topic": db_analysis.topic,
            "urgency_score": db_analysis.urgency_score
        }
    elif db_analysis.status == "FAILED":
        response["error_message"] = db_analysis.error_message
    return response

# --- Serve Frontend ---
# This must be the LAST part of the file
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")