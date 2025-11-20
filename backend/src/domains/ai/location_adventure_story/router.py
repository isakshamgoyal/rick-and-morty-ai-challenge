import logging
from fastapi import APIRouter, HTTPException

from src.domains.ai.generation.models import GenerationResponse
from src.domains.ai.evaluation.models import EvaluationResponse
from src.domains.ai.location_adventure_story.models import (
    LocationAdventureStoryRequest,
    LocationAdventureEvaluationRequest,
)
from src.domains.ai.location_adventure_story.service import location_adventure_story_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/location-adventure-story", tags=["Location Adventure Story"])


@router.post("/generate", response_model=GenerationResponse)
async def generate_location_adventure_story(request: LocationAdventureStoryRequest):
    """Generates a location adventure story using AI based on provided location data."""
    try:
        result = await location_adventure_story_service.generate(request)
        logger.info(f"Successfully generated location adventure story for location {request.location.id}")
        return result
    except ValueError as e:
        logger.warning(f"Invalid request for location adventure story generation: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating location adventure story: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate location adventure story")


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_location_adventure_story(request: LocationAdventureEvaluationRequest, use_llm_judge: bool = False):
    """Evaluate generated location adventure story."""
    try:    
        result = await location_adventure_story_service.evaluate(request, use_llm_judge)
        return result
    except ValueError as e:
        logger.warning(f"Invalid request for location adventure story evaluation: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error evaluating location adventure story: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate location adventure story")
