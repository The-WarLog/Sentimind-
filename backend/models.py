from sqlalchemy import Column, Integer, String, DateTime, Text
from .database import Base
from sqlalchemy.sql import func

class Analysis(Base):
    __tablename__="analysis"
    id=Column(Integer,primary_key=True)
    status=Column(String,default="PENDING",index=True)
    emotion=Column(String,index=True)
    summary=Column(Text)
    topic=Column(String,index=True)
    urgency_score=Column(Integer,index=True)
    error=Column(Text,nullable=True)
    created_at=Column(DateTime(timezone=True), server_default=func.now())



    
