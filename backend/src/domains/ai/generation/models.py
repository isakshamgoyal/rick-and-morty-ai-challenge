from pydantic import BaseModel, ConfigDict

from src.domains.characters.models import CharacterDetailed
from src.domains.locations.models import LocationDetailed


class CharacterBackstoryRequest(BaseModel):
    """Request model for generating character backstory."""
    model_config = ConfigDict(from_attributes=True)
    
    character: CharacterDetailed


class LocationAdventureStoryRequest(BaseModel):
    """Request model for generating location adventure story."""
    model_config = ConfigDict(from_attributes=True)
    
    location: LocationDetailed


class GenerationResponse(BaseModel):
    """Common response model for all AI generation features."""
    model_config = ConfigDict(from_attributes=True)
    
    generated_content: str
