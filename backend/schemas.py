from pydantic import BaseModel
from typing import Optional

class TicketRequest(BaseModel):
    text: str


class AnalysisResult(BaseModel):
    emotion: str
    summary: str
    topic: str
    urgency_score: int

class AnalysisStatusResponse(BaseModel):
    id: int
    status: str
    
    result: Optional[AnalysisResult] = None
    
    error_message: Optional[str] = None

    class Config:
        from_attributes = True