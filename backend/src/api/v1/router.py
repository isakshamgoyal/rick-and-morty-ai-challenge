from fastapi import APIRouter

from src.domains.locations.router import router as locations_router

router = APIRouter()

router.include_router(locations_router, tags=["locations"])