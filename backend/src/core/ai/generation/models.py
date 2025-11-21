from pydantic import BaseModel, ConfigDict


class GenerationResponse(BaseModel):
    """Common response model for all AI generation features."""
    model_config = ConfigDict(from_attributes=True)
    
    generated_content: str

