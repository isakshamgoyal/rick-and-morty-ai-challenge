from typing import Dict
from pydantic import BaseModel, ConfigDict

from src.domains.locations.models import LocationDetailed
from src.core.ai.evaluation.models import EvaluationRequest as BaseEvaluationRequest


class LocationAdventureStoryRequest(BaseModel):
    """Request model for generating location adventure story."""
    model_config = ConfigDict(from_attributes=True)
    
    location: LocationDetailed


class LocationAdventureEvaluationRequest(BaseEvaluationRequest):
    """Request model for evaluating location adventure story with typed metadata."""
    metadata: Dict[str, LocationDetailed]
