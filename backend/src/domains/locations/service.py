import logging

from src.domains.locations.models import LocationsPage
from src.integrations.rick_and_morty_client import RickAndMortyClient

logger = logging.getLogger(__name__)


class LocationsService:
    """Service for location operations."""
    
    def __init__(self):
        self.rick_and_morty_client = RickAndMortyClient()
    
    def get_locations_page(self, page: int = 1) -> LocationsPage:
        """Returns paginated locations with residents."""
        if page < 1:
            raise ValueError("Page must be >= 1")
        
        logger.debug(f"Fetching locations page {page}")
        raw_data = self.rick_and_morty_client.fetch_locations_page(page)
        locations_page = LocationsPage(**raw_data)
        logger.debug(f"Parsed {len(locations_page.results)} locations from page {page}")
        return locations_page

locations_service = LocationsService()