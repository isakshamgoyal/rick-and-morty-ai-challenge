import logging
from typing import Dict, Any

from src.core.exceptions import ExternalServiceException
from src.integrations.rick_and_morty.client import GraphQLClient
from src.integrations.rick_and_morty.queries.locations import LocationQueries
from src.integrations.rick_and_morty.queries.characters import CharacterQueries
from src.integrations.rick_and_morty.queries.episodes import EpisodeQueries

logger = logging.getLogger(__name__)


class RickAndMortyService:
    """Provides methods to fetch locations, characters and episodes from Rick & Morty API."""
    
    def __init__(self):
        """Initializes the service with a GraphQL client."""
        self.client = GraphQLClient()
    
    def fetch_locations_page(self, page: int = 1) -> Dict[str, Any]:
        """Fetches a paginated list of locations with basic information."""
        try:
            result = self.client.execute(
                LocationQueries.GET_LOCATIONS_PAGE,
                variables={"page": page}
            )
            locations_data = result['locations']
            logger.info(f"Fetched page {page}: {len(locations_data['results'])} locations")
            return locations_data
        except Exception as e:
            logger.error(f"Error fetching locations page {page}: {e}")
            raise ExternalServiceException(f"Failed to fetch locations: {str(e)}")
    
    def fetch_location_by_id(self, location_id: int) -> Dict[str, Any]:
        """Fetches a single location by ID including all resident characters."""
        try:
            result = self.client.execute(
                LocationQueries.GET_LOCATION_BY_ID,
                variables={"id": str(location_id)}
            )
            location_data = result['location']
            logger.info(f"Fetched location: {location_data['name']}")
            return location_data
        except Exception as e:
            logger.error(f"Error fetching location {location_id}: {e}")
            raise ExternalServiceException(f"Failed to fetch location: {str(e)}")
    
    def fetch_locations_with_residents_page(self, page: int = 1) -> Dict[str, Any]:
        """Fetches a paginated list of locations with their resident characters."""
        try:
            result = self.client.execute(
                LocationQueries.GET_LOCATIONS_WITH_RESIDENTS_PAGE,
                variables={"page": page}
            )
            locations_data = result['locations']
            logger.info(f"Fetched page {page}: {len(locations_data['results'])} locations")
            return locations_data
        except Exception as e:
            logger.error(f"Error fetching locations page {page}: {e}")
            raise ExternalServiceException(f"Failed to fetch locations: {str(e)}")
    
    def fetch_characters_page(self, page: int = 1) -> Dict[str, Any]:
        """Fetches a paginated list of characters with basic information."""
        try:
            result = self.client.execute(
                CharacterQueries.GET_CHARACTERS_PAGE,
                variables={"page": page}
            )
            characters_data = result['characters']
            logger.info(f"Fetched page {page}: {len(characters_data['results'])} characters")
            return characters_data
        except Exception as e:
            logger.error(f"Error fetching characters page {page}: {e}")
            raise ExternalServiceException(f"Failed to fetch characters: {str(e)}")
    
    def fetch_character_by_id(self, character_id: int) -> Dict[str, Any]:
        """Fetches a single character by ID including all available details."""
        try:
            result = self.client.execute(
                CharacterQueries.GET_CHARACTER_BY_ID,
                variables={"id": str(character_id)}
            )
            character_data = result['character']
            logger.info(f"Fetched character: {character_data['name']}")
            return character_data
        except Exception as e:
            logger.error(f"Error fetching character {character_id}: {e}")
            raise ExternalServiceException(f"Failed to fetch character: {str(e)}")

    def fetch_episodes_page(self, page: int = 1) -> Dict[str, Any]:
        """Fetches a paginated list of episodes with basic information."""
        try:
            result = self.client.execute(
                EpisodeQueries.GET_EPISODES_PAGE,
                variables={"page": page}
            )
            episodes_data = result["episodes"]
            logger.info(f"Fetched page {page}: {len(episodes_data['results'])} episodes")
            return episodes_data
        except Exception as e:
            logger.error(f"Error fetching episodes page {page}: {e}")
            raise ExternalServiceException(f"Failed to fetch episodes: {str(e)}")

    def fetch_episode_by_id(self, episode_id: int) -> Dict[str, Any]:
        """Fetches a single episode by ID including all available details."""
        try:
            result = self.client.execute(
                EpisodeQueries.GET_EPISODE_BY_ID,
                variables={"id": str(episode_id)}
            )
            episode_data = result["episode"]
            logger.info(f"Fetched episode: {episode_data['name']}")
            return episode_data
        except Exception as e:
            logger.error(f"Error fetching episode {episode_id}: {e}")
            raise ExternalServiceException(f"Failed to fetch episode: {str(e)}")


# Singleton instance
rick_and_morty_service = RickAndMortyService()
