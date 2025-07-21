from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from . import models,schemas

async def get_all_analyses(db: AsyncSession) -> list[models.Analysis]:
    result = await db.execute(select(models.Analysis).order_by(models.Analysis.created_at.desc()))
    return list(result.scalars().all())

async def delete_all_analyses(db: AsyncSession):
    await db.execute(delete(models.Analysis))
    await db.commit()

# UPDATED: The threshold is now passed as an argument
async def delete_alerts(db: AsyncSession, urgency_threshold: int):
    stmt = delete(models.Analysis).where(models.Analysis.urgency_score >= urgency_threshold)
    await db.execute(stmt)
    await db.commit()

async def delete_analysis_by_id(db: AsyncSession, analysis_id: int):
    item_to_delete = await get_analysis(db, analysis_id)
    if item_to_delete:
        await db.delete(item_to_delete)
        await db.commit()
    return item_to_delete

async def create_pending_analysis(db: AsyncSession, ticket_text: str) -> models.Analysis:
    db_analysis = models.Analysis(status="PENDING", ticket_text=ticket_text)
    db.add(db_analysis)
    await db.commit()
    await db.refresh(db_analysis)
    return db_analysis

async def get_analysis(db: AsyncSession, analysis_id: int) -> models.Analysis | None:
    result = await db.execute(select(models.Analysis).where(models.Analysis.id == analysis_id))
    return result.scalar_one_or_none()

async def update_analysis_result(db: AsyncSession, analysis_id: int, result: schemas.AnalysisResult):
    db_analysis = await get_analysis(db, analysis_id)
    if db_analysis:
        db_analysis.status = "COMPLETE"
        db_analysis.emotion = result.emotion
        db_analysis.summary = result.summary
        db_analysis.topic = result.topic
        db_analysis.urgency_score = result.urgency_score
        await db.commit()
