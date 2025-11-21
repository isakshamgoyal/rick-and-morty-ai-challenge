import logging

from src.domains.episodes.models import EpisodesPage, EpisodeDetailed
from src.integrations.rick_and_morty.service import rick_and_morty_service

logger = logging.getLogger(__name__)


class EpisodesService:
    """Service for episode operations."""

    def __init__(self):
        self.rick_and_morty_service = rick_and_morty_service

    def get_episodes_page(self, page: int = 1) -> EpisodesPage:
        """Returns paginated episodes with minimal fields."""
        if page < 1:
            raise ValueError("Page must be >= 1")

        logger.debug(f"Fetching episodes page {page}")
        raw_data = self.rick_and_morty_service.fetch_episodes_page(page)
        episodes_page = EpisodesPage(**raw_data)
        logger.debug(f"Parsed {len(episodes_page.results)} episodes from page {page}")
        return episodes_page

    def get_episode_by_id(self, episode_id: int) -> EpisodeDetailed:
        """Get a single episode by ID with all details."""
        logger.debug(f"Fetching episode {episode_id}")
        raw_data = self.rick_and_morty_service.fetch_episode_by_id(episode_id)
        episode = EpisodeDetailed(**raw_data)
        logger.debug(f"Fetched episode: {episode.name}")
        return episode


# Singleton instance
episodes_service = EpisodesService()


