from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class Character(BaseModel):
    """Character with only required fields."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    status: str
    species: str
    image: str


class CharacterLocation(BaseModel):
    """Character's location information."""
    model_config = ConfigDict(from_attributes=True)
    
    name: str
    type: str
    dimension: str


class Episode(BaseModel):
    """Episode information."""
    model_config = ConfigDict(from_attributes=True)
    
    name: str
    air_date: str


class CharacterDetailed(BaseModel):
    """Character with all fields for detailed view."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    status: str
    species: str
    type: str
    gender: str
    origin: CharacterLocation
    location: CharacterLocation
    image: str
    episode: List[Episode] = []
    created: str


class PaginationInfo(BaseModel):
    """Pagination metadata."""
    model_config = ConfigDict(from_attributes=True)
    
    count: int
    pages: int
    next: Optional[int] = None
    prev: Optional[int] = None


class CharactersPage(BaseModel):
    """Paginated characters response."""
    model_config = ConfigDict(from_attributes=True)
    
    info: PaginationInfo
    results: List[Character]
