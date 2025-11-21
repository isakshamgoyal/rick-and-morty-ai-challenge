from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class Episode(BaseModel):
    """Episode with only required fields."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    air_date: str
    episode: str


class EpisodeCharacter(BaseModel):
    """Character appearing in an episode (minimal fields)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    status: str
    species: str
    image: str


class EpisodeDetailed(BaseModel):
    """Episode with all fields for detailed view."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    air_date: str
    episode: str
    characters: List[EpisodeCharacter] = []
    created: str


class PaginationInfo(BaseModel):
    """Pagination metadata."""
    model_config = ConfigDict(from_attributes=True)

    count: int
    pages: int
    next: Optional[int] = None
    prev: Optional[int] = None


class EpisodesPage(BaseModel):
    """Paginated episodes response."""
    model_config = ConfigDict(from_attributes=True)

    info: PaginationInfo
    results: List[Episode]


