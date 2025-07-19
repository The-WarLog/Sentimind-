#for databse async connection
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

load_dotenv()
DATBASE_URL=os.getenv("DATABASE_URL")
engine=create_async_engine(DATBASE_URL)#granting the databse to the api
AsyncSesssionLocal=async_sessionmaker(engine,expire_on_commit=False) #creating a session for aync databse connections
Base=declarative_base()