import logging

from src.core.ai.generation.base import BaseGenerationService
from src.core.ai.generation.models import GenerationResponse
from src.core.ai.evaluation.models import EvaluationResponse
from src.core.ai.evaluation.service import evaluation_service
from src.domains.ai.utils import clean_prompt, build_location_context
from src.domains.ai.location_adventure_story.models import (
    LocationAdventureStoryRequest,
    LocationAdventureEvaluationRequest,
)
from src.domains.ai.location_adventure_story.evaluator import LocationAdventureEvaluator

logger = logging.getLogger(__name__)


class LocationAdventureStoryService(BaseGenerationService):
    """Service for generating location adventure stories using AI."""
    
    EVALUATION_WEIGHTS = {
        "factual_consistency": 0.30,
        "resident_relevance": 0.20,
        "source_semantic_alignment": 0.20,
        "narrative_relevance": 0.15,
        "tone_style": 0.10,
        "narrative_coherence": 0.05,
        "cosine_similarity": 0.25
    }
    
    def __init__(self):
        super().__init__("location_adventure_story_system.txt")
        self.evaluator = LocationAdventureEvaluator()
    
    def _build_user_prompt(self, request: LocationAdventureStoryRequest) -> str:
        """Formats location data into a user prompt for adventure story generation."""
        location = request.location
        location_context = build_location_context(location)
        
        user_prompt = f"""Generate an adventure story for this location: {location_context}."""
        return clean_prompt(user_prompt)
    
    async def generate(self, request: LocationAdventureStoryRequest) -> GenerationResponse:
        """Generates a location adventure story using AI based on provided location data."""
        loc = request.location
        logger.info(f"Generating location adventure story for {loc.name} (ID: {loc.id})")
        return await super().generate(request)
    
    async def evaluate(self, request: LocationAdventureEvaluationRequest, use_llm_judge: bool = False) -> EvaluationResponse:
        """Evaluate generated location adventure story."""
        metadata = request.metadata or {}
        location = metadata.get("location")
        source_context = build_location_context(location) if location else ""
        
        return await evaluation_service.evaluate(
            evaluator=self.evaluator,
            weights=self.EVALUATION_WEIGHTS,
            request=request,
            use_llm_judge=use_llm_judge,
            source_context=source_context
        )


location_adventure_story_service = LocationAdventureStoryService()
