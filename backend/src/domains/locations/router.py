import logging

from fastapi import APIRouter, HTTPException, Query

from src.core.exceptions import ExternalServiceException

from src.domains.locations import models as locations_models
from src.domains.locations.service import locations_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=locations_models.LocationsPage)
async def get_locations(page: int = Query(1, ge=1, description="Page number")):
    """Returns paginated locations with residents."""
    logger.info(f"Fetching locations page {page}")
    try:
        result = locations_service.get_locations_page(page)
        logger.info(f"Successfully fetched page {page}: {len(result.results)} locations")
        return result
    except ValueError as e:
        logger.warning(f"Invalid page number: {page}")
        raise HTTPException(status_code=400, detail=str(e))
    except ExternalServiceException as e:
        logger.error(f"External API error for page {page}: {str(e)}")
        raise HTTPException(status_code=502, detail=f"External API error: {str(e)}")
    except Exception as e:
        logger.error(f"Internal error fetching page {page}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")