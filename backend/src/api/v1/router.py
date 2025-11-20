from fastapi import APIRouter

from src.domains.locations.router import router as locations_router
from src.domains.characters.router import router as characters_router
from src.domains.notes.router import router as notes_router
from src.domains.ai.router import router as ai_router

router = APIRouter()

router.include_router(locations_router)
router.include_router(characters_router)
router.include_router(notes_router)
router.include_router(ai_router)