from fastapi import APIRouter

from src.domains.locations.router import router as locations_router
from src.domains.notes.router import router as notes_router

router = APIRouter()

router.include_router(locations_router)
router.include_router(notes_router)