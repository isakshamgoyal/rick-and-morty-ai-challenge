from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class Character(BaseModel):
    """Character with only required fields."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    status: str  # Alive, Dead, unknown
    species: str
    image: str


class Location(BaseModel):
    """Location with nested residents."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    type: str
    dimension: str
    residents: List[Character] = []


class PaginationInfo(BaseModel):
    """Pagination metadata."""
    model_config = ConfigDict(from_attributes=True)
    
    count: int
    pages: int
    next: Optional[int] = None
    prev: Optional[int] = None


class LocationsPage(BaseModel):
    """Paginated locations response."""
    model_config = ConfigDict(from_attributes=True)
    
    info: PaginationInfo
    results: List[Location]

