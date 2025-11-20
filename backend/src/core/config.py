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
    
    # Azure OpenAI
    AZURE_OPENAI_API_KEY: str = Field(
        default="",
        description="Azure OpenAI API Key",
        env="AZURE_OPENAI_API_KEY"
    )
    AZURE_OPENAI_ENDPOINT: str = Field(
        default="",
        description="Azure OpenAI Endpoint URL",
        env="AZURE_OPENAI_ENDPOINT"
    )
    AZURE_OPENAI_DEPLOYMENT: str = Field(
        default="gpt-4o",
        description="Azure OpenAI Deployment Name",
        env="AZURE_OPENAI_DEPLOYMENT"
    )
    AZURE_OPENAI_API_VERSION: str = Field(
        default="2024-02-15-preview",
        description="Azure OpenAI API Version",
        env="AZURE_OPENAI_API_VERSION"
    )
        
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()