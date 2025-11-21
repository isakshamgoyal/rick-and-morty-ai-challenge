import logging
from fastapi import APIRouter, HTTPException, Query

from src.domains.episodes import models as episodes_models
from src.domains.episodes.service import episodes_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/episodes", tags=["Episodes"])


@router.get("", response_model=episodes_models.EpisodesPage)
async def get_episodes(page: int = Query(1, ge=1, description="Page number")):
    """Returns paginated episodes with minimal details."""
    logger.info(f"Fetching episodes page {page}")
    try:
        result = episodes_service.get_episodes_page(page)
        logger.info(f"Successfully fetched page {page}: {len(result.results)} episodes")
        return result
    except ValueError as e:
        logger.warning(f"Invalid page number: {page} {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching episodes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch episodes")


@router.get("/{episode_id}", response_model=episodes_models.EpisodeDetailed)
async def get_episode(episode_id: int) -> episodes_models.EpisodeDetailed:
    """Returns a single episode by ID with all details."""
    try:
        return episodes_service.get_episode_by_id(episode_id)
    except Exception as e:
        logger.error(f"Error fetching episode {episode_id}: {e}")
        raise HTTPException(status_code=404, detail="Episode not found")


