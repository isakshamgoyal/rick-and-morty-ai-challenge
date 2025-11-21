import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from src.core.database.connection import db_connection
from src.domains.ai.search import models as search_models
from src.domains.ai.search.service import SearchService


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=search_models.SearchResponse)
async def search(
    query: str = Query(..., description="Search query text"),
    limit: int = Query(5, ge=1, le=50, description="Maximum number of results to return"),
    db: Session = Depends(db_connection.get_db),
):
    """Search over indexed entities using semantic similarity."""
    try:
        service = SearchService(db)
        return await service.search(query, limit=limit)
    except Exception as e:
        logger.error(f"Error during search: {e}")
        raise HTTPException(status_code=500, detail="Search failed")


@router.post("/index", response_model=search_models.EntityIndexResponse, status_code=201)
async def index_entity(
    payload: search_models.EntityIndexRequest,
    db: Session = Depends(db_connection.get_db),
):
    """Index an entity context into the search_index table."""
    try:
        service = SearchService(db)
        return await service.index_entity(payload)
    except Exception as e:
        logger.error(f"Error indexing entity into search_index: {e}")
        raise HTTPException(status_code=500, detail="Indexing failed")


