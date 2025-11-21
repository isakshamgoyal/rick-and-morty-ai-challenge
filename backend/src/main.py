import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import core configuration
from src.core.config import settings
from src.core.database.connection import db_connection, Base

# Import API routers
from src.api.v1.router import router as api_router_v1

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for FastAPI app."""
    # Startup
    logger.info("Initializing database connection...")
    try:
        db_connection.init_db()
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    
    yield
    
    # Shutdown
    logger.info("Closing database connection...")
    db_connection.close_db()
    logger.info("Database connection closed")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Rick & Morty Locations API",
    lifespan=lifespan,
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
            "locations": f"{settings.API_V1_PREFIX}/locations",
            "notes": f"{settings.API_V1_PREFIX}/notes"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.VERSION
    }