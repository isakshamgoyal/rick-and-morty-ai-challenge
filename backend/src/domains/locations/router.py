import logging
from typing import Union
from fastapi import APIRouter, HTTPException, Query

from src.domains.locations import models as locations_models
from src.domains.locations.service import locations_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=Union[locations_models.LocationsPage, locations_models.LocationsWithResidentsPage])
async def get_locations(
    page: int = Query(1, ge=1, description="Page number"),
    include_residents: bool = Query(False, description="Include residents in the response")
):
    """Returns paginated locations, optionally with residents."""
    logger.info(f"Fetching locations page {page}, include_residents={include_residents}")
    try:
        if include_residents:
            result = locations_service.get_locations_with_residents_page(page)
            logger.info(f"Successfully fetched page {page}: {len(result.results)} locations with residents")
        else:
            result = locations_service.get_locations_page(page)
            logger.info(f"Successfully fetched page {page}: {len(result.results)} locations")
        return result
    except ValueError as e:
        logger.warning(f"Invalid page number: {page} {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching locations: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch locations")


@router.get("/{location_id}", response_model=locations_models.LocationDetailed)
async def get_location(location_id: int) -> locations_models.LocationDetailed:
    """Returns a single location by ID"""
    try:
        return locations_service.get_location_by_id(location_id)
    except Exception as e:
        logger.error(f"Error fetching location {location_id}: {e}")
        raise HTTPException(status_code=404, detail="Location not found")
