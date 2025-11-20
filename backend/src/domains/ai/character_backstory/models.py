from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict

from src.domains.characters.models import CharacterDetailed
from src.domains.ai.evaluation.models import EvaluationRequest as BaseEvaluationRequest


class CharacterBackstoryRequest(BaseModel):
    """Request model for generating character backstory."""
    model_config = ConfigDict(from_attributes=True)
    
    character: CharacterDetailed


class CharacterBackstoryEvaluationRequest(BaseEvaluationRequest):
    """Request model for evaluating character backstory with typed metadata."""
    metadata: Dict[str, CharacterDetailed]
