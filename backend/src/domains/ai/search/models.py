from typing import Literal, Optional, Any

from sqlalchemy import Column, Integer, String, Text, DateTime, func
from pgvector.sqlalchemy import Vector
from pydantic import BaseModel, ConfigDict

from src.core.database.connection import Base


class SearchIndex(Base):
    """SQLAlchemy model for search_indexes table."""

    __tablename__ = "search_indexes"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    entity_type = Column(String, nullable=False, index=True)
    context = Column(Text, nullable=False)
    embedding = Column(Vector(1536))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class SearchResult(BaseModel):
    """Single search result."""

    score: float | None = None
    entity_id: int
    entity_type: Literal["character", "location", "episode"]
    entity_data: dict[str, Any] = {}


class SearchInfo(BaseModel):
    """Search info."""

    query: str
    limit: int
    total_results: int

class SearchResponse(BaseModel):
    """Search response."""

    info: SearchInfo
    results: list[SearchResult]


class EntityIndexRequest(BaseModel):
    """Index request for an entity context."""

    id: int
    type: Literal["character", "location", "episode"]
    additional_context: str = ""


class EntityIndexResponse(BaseModel):
    """Indexed search record."""
    model_config = ConfigDict(from_attributes=True)

    id: int               # internal search_index row id
    entity_id: int
    entity_type: Literal["character", "location", "episode"]
    context: str