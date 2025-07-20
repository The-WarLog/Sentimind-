from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True)
    status = Column(String, default="PENDING", index=True)
    ticket_text = Column(Text, nullable=False)
    emotion = Column(String, nullable=True, index=True)
    summary = Column(Text, nullable=True)
    topic = Column(String, nullable=True, index=True)
    urgency_score = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())