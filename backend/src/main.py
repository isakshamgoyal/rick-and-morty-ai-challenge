import logging
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.api.v1.router import router as api_router_v1

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Rick & Morty Locations API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router_v1, prefix=settings.API_V1_PREFIX)

logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "message": "Rick & Morty Locations API",
        "version": settings.VERSION,
        "endpoints": {
            "locations": f"{settings.API_V1_PREFIX}/locations"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.VERSION
    }