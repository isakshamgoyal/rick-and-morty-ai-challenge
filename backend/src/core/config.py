from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Rick & Morty AI Challenge API"
    VERSION: str = "1.0.0"
    
    RICK_MORTY_GRAPHQL_URL: str = "https://rickandmortyapi.com/graphql"
    
    ALLOWED_ORIGINS: List[str] = ["*"]
        
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()