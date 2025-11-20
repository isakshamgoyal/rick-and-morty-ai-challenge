import logging

from src.domains.characters.models import CharactersPage, CharacterDetailed
from src.integrations.rick_and_morty.service import rick_and_morty_service

logger = logging.getLogger(__name__)


class CharactersService:
    """Service for character operations."""
    
    def __init__(self):
        self.rick_and_morty_service = rick_and_morty_service
    
    def get_characters_page(self, page: int = 1) -> CharactersPage:
        """Returns paginated characters with minimal fields."""
        if page < 1:
            raise ValueError("Page must be >= 1")
        
        logger.debug(f"Fetching characters page {page}")
        raw_data = self.rick_and_morty_service.fetch_characters_page(page)
        characters_page = CharactersPage(**raw_data)
        logger.debug(f"Parsed {len(characters_page.results)} characters from page {page}")
        return characters_page
    
    def get_character_by_id(self, character_id: int) -> CharacterDetailed:
        """Get a single character by ID with all details."""
        logger.debug(f"Fetching character {character_id}")
        raw_data = self.rick_and_morty_service.fetch_character_by_id(character_id)
        character = CharacterDetailed(**raw_data)
        logger.debug(f"Fetched character: {character.name}")
        return character


# Singleton instance
characters_service = CharactersService()