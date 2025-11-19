from typing import List, Literal

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings."""
    
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Rick & Morty AI Challenge API"
    VERSION: str = "1.0.0"

    # Environment
    ENVIRONMENT: Literal["development", "production", "testing"] = Field(
        default="development",
        description="Application environment",
        env="ENVIRONMENT"
    )
    
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = Field(
        default="",
        description="PostgreSQL connection string",
        env="DATABASE_URL"
    )
    
    RICK_MORTY_GRAPHQL_URL: str = "https://rickandmortyapi.com/graphql"
        
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()