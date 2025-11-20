from pydantic import BaseModel, ConfigDict

from src.domains.characters.models import CharacterDetailed


class CharacterBackstoryRequest(BaseModel):
    """Request model for generating character backstory."""
    model_config = ConfigDict(from_attributes=True)
    
    character: CharacterDetailed


class GenerationResponse(BaseModel):
    """Common response model for all AI generation features."""
    model_config = ConfigDict(from_attributes=True)
    
    generated_content: str
