import logging
from fastapi import APIRouter, HTTPException, Query

from src.domains.characters import models as characters_models
from src.domains.characters.service import characters_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/characters", tags=["Characters"])


@router.get("", response_model=characters_models.CharactersPage)
async def get_characters(page: int = Query(1, ge=1, description="Page number")):
    """Returns paginated characters with minimal details."""
    logger.info(f"Fetching characters page {page}")
    try:
        result = characters_service.get_characters_page(page)
        logger.info(f"Successfully fetched page {page}: {len(result.results)} characters")
        return result
    except ValueError as e:
        logger.warning(f"Invalid page number: {page} {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching characters: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch characters")


@router.get("/{character_id}", response_model=characters_models.CharacterDetailed)
async def get_character(character_id: int) -> characters_models.CharacterDetailed:
    """Returns a single character by ID with all details."""
    try:
        return characters_service.get_character_by_id(character_id)
    except Exception as e:
        logger.error(f"Error fetching character {character_id}: {e}")
        raise HTTPException(status_code=404, detail="Character not found")

