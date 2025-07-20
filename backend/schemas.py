from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TicketRequest(BaseModel):
    text: str

class AnalysisResult(BaseModel):
    emotion: str
    summary: str
    topic: str
    urgency_score: int

class AnalysisResponse(BaseModel):
    id: int
    status: str
    ticket_text: str
    created_at: datetime
    result: Optional[AnalysisResult] = None
    error_message: Optional[str] = None
    class Config:
        from_attributes = True