import logging
from typing import Dict, Any, Optional
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

from src.core.config import settings
from src.core.exceptions import ExternalServiceException

logger = logging.getLogger(__name__)


class RickAndMortyClient:
    """GraphQL client for Rick & Morty API."""
    
    def __init__(self):
        transport = RequestsHTTPTransport(
            url=settings.RICK_MORTY_GRAPHQL_URL,
            retries=3,
            timeout=30
        )
        self.client = Client(transport=transport, fetch_schema_from_transport=False)
    
    def fetch_locations_page(self, page: int = 1) -> Dict[str, Any]:
        """Returns paginated locations without residents (minimal fields)."""
        query = gql("""
            query GetLocationsPage($page: Int!) {
                locations(page: $page) {
                    info {
                        count
                        pages
                        next
                        prev
                    }
                    results {
                        id
                        name
                        type
                        dimension
                    }
                }
            }
        """)
        
        try:
            result = self.client.execute(query, variable_values={"page": page})
            locations_data = result['locations']
            logger.info(f"Fetched page {page}: {len(locations_data['results'])} locations")
            return locations_data

        except Exception as e:
            logger.error(f"Error fetching locations page {page}: {e}")
            raise ExternalServiceException(f"Failed to fetch locations: {str(e)}")
    
    def fetch_location_by_id(self, location_id: int) -> Dict[str, Any]:
        """
        Fetch a single location by ID with residents.
        
        Args:
            location_id: Location ID
            
        Returns:
            Dict with location data including residents
        """
        query = gql("""
            query GetLocation($id: ID!) {
                location(id: $id) {
                    id
                    name
                    type
                    dimension
                    residents {
                        id
                        name
                        status
                        species
                        image
                    }
                }
            }
        """)
        
        try:
            result = self.client.execute(query, variable_values={"id": str(location_id)})
            location_data = result['location']
            logger.info(f"Fetched location: {location_data['name']}")
            return location_data
            
        except Exception as e:
            logger.error(f"Error fetching location {location_id}: {e}")
            raise ExternalServiceException(f"Failed to fetch location: {str(e)}")

    def fetch_locations_with_residents_page(self, page: int = 1) -> Dict[str, Any]:
        """Returns paginated locations with nested residents."""
        query = gql("""
            query GetLocationsWithResidentsPage($page: Int!) {
                locations(page: $page) {
                    info {
                        count
                        pages
                        next
                        prev
                    }
                    results {
                        id
                        name
                        type
                        dimension
                        residents {
                            id
                            name
                            status
                            species
                            image
                        }
                    }
                }
            }
        """)
        
        try:
            result = self.client.execute(query, variable_values={"page": page})
            locations_data = result['locations']
            logger.info(f"Fetched page {page}: {len(locations_data['results'])} locations")
            return locations_data

        except Exception as e:
            logger.error(f"Error fetching locations page {page}: {e}")
            raise ExternalServiceException(f"Failed to fetch locations: {str(e)}")

