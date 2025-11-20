import logging
from fastapi import APIRouter, HTTPException

from src.domains.ai.generation import models
from src.domains.ai.generation.service import character_backstory_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate", tags=["AI Generation"])


@router.post("/character-backstory", response_model=models.GenerationResponse)
async def generate_character_backstory(request: models.CharacterBackstoryRequest):
    """Generates a character backstory using AI based on provided character data."""
    try:
        result = await character_backstory_service.generate(request)
        logger.info(f"Successfully generated character backstory for character {request.character.id}")
        return result
    except ValueError as e:
        logger.warning(f"Invalid request for character backstory generation: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating character backstory: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate character backstory")

