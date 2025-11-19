from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Text, DateTime, func

from pydantic import BaseModel, ConfigDict

from src.core.database import Base


class Note(Base):
    """SQLAlchemy model for character notes."""
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    character_id = Column(Integer, nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class NoteCreate(BaseModel):
    """Request model for creating a note."""
    character_id: int
    content: str


class NoteUpdate(BaseModel):
    """Request model for updating a note."""
    content: str


class NoteResponse(BaseModel):
    """Response model for a note."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    character_id: int
    content: str
    created_at: datetime
    updated_at: datetime


class NotesListResponse(BaseModel):
    """Response model for a list of notes."""
    notes: list[NoteResponse]
    total: int

