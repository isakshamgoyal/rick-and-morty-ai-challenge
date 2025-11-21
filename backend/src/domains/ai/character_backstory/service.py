import logging

from src.core.ai.generation.base import BaseGenerationService
from src.core.ai.generation.models import GenerationResponse
from src.core.ai.evaluation.models import EvaluationResponse
from src.core.ai.evaluation.service import evaluation_service
from src.core.utils import clean_prompt, build_character_context
from src.domains.ai.character_backstory.models import (
    CharacterBackstoryRequest,
    CharacterBackstoryEvaluationRequest,
)
from src.domains.ai.character_backstory.evaluator import CharacterBackstoryEvaluator

logger = logging.getLogger(__name__)


class CharacterBackstoryService(BaseGenerationService):
    """Service for generating character backstories using AI."""
    
    EVALUATION_WEIGHTS = {
        "factual_consistency": 0.30,
        "source_semantic_alignment": 0.25,
        "narrative_relevance": 0.20,
        "tone_style": 0.15,
        "narrative_coherence": 0.10,
        "cosine_similarity": 0.25
    }
    
    def __init__(self):
        super().__init__("character_backstory_system.txt")
        self.evaluator = CharacterBackstoryEvaluator()
    
    def _build_user_prompt(self, request: CharacterBackstoryRequest) -> str:
        """Formats character data into a user prompt for backstory generation."""
        character = request.character
        character_context = build_character_context(character)
        
        user_prompt = f"""Generate a backstory for this character: {character_context}"""
        return clean_prompt(user_prompt)
    
    async def generate(self, request: CharacterBackstoryRequest) -> GenerationResponse:
        """Generates a character backstory using AI based on provided character data."""
        character = request.character
        logger.info(f"Generating character backstory for {character.name} (ID: {character.id})")
        return await super().generate(request)
    
    async def evaluate(self, request: CharacterBackstoryEvaluationRequest, use_llm_judge: bool = False) -> EvaluationResponse:
        """Evaluate generated character backstory."""
        metadata = request.metadata or {}
        character = metadata.get("character")
        source_context = build_character_context(character) if character else ""

        return await evaluation_service.evaluate(
            evaluator=self.evaluator,
            request=request,
            weights=self.EVALUATION_WEIGHTS,
            source_context=source_context,
            use_llm_judge=use_llm_judge
        )

character_backstory_service = CharacterBackstoryService()
