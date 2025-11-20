import logging
from typing import Optional

from src.domains.locations.models import LocationsPage, LocationDetailed, LocationsWithResidentsPage
from src.integrations.rick_and_morty_client import RickAndMortyClient

logger = logging.getLogger(__name__)


class LocationsService:
    """Service for location operations."""
    
    def __init__(self):
        self.rick_and_morty_client = RickAndMortyClient()
    
    def get_locations_page(self, page: int = 1) -> LocationsPage:
        """Returns paginated locations"""
        if page < 1:
            raise ValueError("Page must be >= 1")
        
        logger.debug(f"Fetching locations page {page}")
        raw_data = self.rick_and_morty_client.fetch_locations_page(page)
        locations_page = LocationsPage(**raw_data)
        logger.debug(f"Parsed {len(locations_page.results)} locations from page {page}")
        return locations_page
    
    def get_location_by_id(self, location_id: int) -> LocationDetailed:
        """Get a single location by ID with residents."""
        logger.debug(f"Fetching location {location_id}")
        raw_data = self.rick_and_morty_client.fetch_location_by_id(location_id)
        location = LocationDetailed(**raw_data)
        logger.debug(f"Fetched location: {location.name} with {len(location.residents)} residents")
        return location


    def get_locations_with_residents_page(self, page: int = 1) -> LocationsWithResidentsPage:
        """Returns paginated locations with residents."""
        if page < 1:
            raise ValueError("Page must be >= 1")

        logger.debug(f"Fetching locations with residents page {page}")
        raw_data = self.rick_and_morty_client.fetch_locations_with_residents_page(page)
        locations_page = LocationsWithResidentsPage(**raw_data)
        logger.debug(f"Parsed {len(locations_page.results)} locations with residents from page {page}")
        return locations_page


# Singleton instance
locations_service = LocationsService()