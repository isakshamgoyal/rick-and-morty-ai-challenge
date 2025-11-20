from fastapi import APIRouter

from src.domains.ai.generation.router import router as generation_router

router = APIRouter(prefix="/ai", tags=["AI"])

router.include_router(generation_router)
