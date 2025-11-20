from fastapi import APIRouter

from src.domains.ai.character_backstory.router import router as character_backstory_router
from src.domains.ai.location_adventure_story.router import router as location_adventure_router

router = APIRouter(prefix="/ai", tags=["AI"])

router.include_router(character_backstory_router)
router.include_router(location_adventure_router)
