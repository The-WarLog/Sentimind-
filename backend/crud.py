from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from . import models ,schemas
async def create_pending_analysis(db : AsyncSession) -> models.Analysis:
    db_analysis=models.Analysis(status="PENDING")
    db.add(db_analysis)
    await db.commit()
    return db_analysis
async  def get_analysis(db:AsyncSession,id:int)->models.Analysis:
    result=await db.execute(select(models.Analysis).where(models.Analysis.id==id))
    return result.scalar_one_or_none()

async def update_analysis_results(db:AsyncSession,id:int, result: schemas.AnalysisResults)->models.Analysis:
    db_analysis=await get_analysis(db,id)
    if db_analysis:
        db_analysis.status="COMPLETED"
        db_analysis.emotion=result.emotion
        db_analysis.summary=result.summary
        db_analysis.topic=result.topic
        db_analysis.urgency_score=result.urgency_score
        await db.commit()
        await db.refresh(db_analysis)
    return db_analysis
async def update_analysis_error(db:AsyncSession,id:int,error_m:str)->models.Analysis:
    db_analysis=await get_analysis(db,id)
    if db_analysis:
        db_analysis.status="FAILED"
        db_analysis.error = error_m 
        await db.commit()
        #await db.refresh(db_analysis)
    return db_analysis

