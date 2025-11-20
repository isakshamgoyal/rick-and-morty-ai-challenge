import logging
from fastapi import APIRouter, HTTPException

from src.domains.ai.generation.models import GenerationResponse
from src.domains.ai.character_backstory.models import (
    CharacterBackstoryRequest,
    CharacterBackstoryEvaluationRequest,
)
from src.domains.ai.evaluation.models import EvaluationResponse
from src.domains.ai.character_backstory.service import character_backstory_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/character-backstory", tags=["Character Backstory"])


@router.post("/generate", response_model=GenerationResponse)
async def generate_character_backstory(request: CharacterBackstoryRequest):
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


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_character_backstory(request: CharacterBackstoryEvaluationRequest, use_llm_judge: bool = False):
    """Evaluate generated character backstory."""
    try:    
        result = await character_backstory_service.evaluate(request, use_llm_judge)
        return result
    except ValueError as e:
        logger.warning(f"Invalid request for character backstory evaluation: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error evaluating character backstory: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate character backstory")
