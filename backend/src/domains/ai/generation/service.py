import logging
from pathlib import Path

from src.domains.ai.generation.models import (
    CharacterBackstoryRequest,
    GenerationResponse
)
from src.integrations.azure_openai_client import azure_openai_client

logger = logging.getLogger(__name__)


class CharacterBackstoryService:
    """Service for generating character backstories using AI."""
    
    def __init__(self):
        self.azure_client = azure_openai_client
        self._system_prompt = None
    
    def _load_system_prompt(self) -> str:
        """Loads and caches the system prompt for character backstory generation."""
        if self._system_prompt is None:
            prompt_path = Path(__file__).parent / "prompts" / "character_backstory_system.txt"
            try:
                with open(prompt_path, "r", encoding="utf-8") as f:
                    self._system_prompt = f.read().strip()
                logger.debug("Loaded system prompt for character backstory")
            except FileNotFoundError:
                logger.error(f"System prompt file not found: {prompt_path}")
                raise
        return self._system_prompt
    
    def _build_user_prompt(self, request: CharacterBackstoryRequest) -> str:
        """Formats character data into a user prompt for backstory generation."""
        char = request.character
        episode_count = len(char.episode)
        
        return f"""Generate a backstory for this character:

Name: {char.name}
Species: {char.species}
Status: {char.status}
Gender: {char.gender}
Type: {char.type}
Origin: {char.origin.name} ({char.origin.dimension})
Current Location: {char.location.name} ({char.location.dimension})
Total Episodes: {episode_count} episode(s)
All the episodes in which the character appeared: {", ".join(episode.name for episode in char.episode)}

Generate an engaging backstory for this character."""
    
    async def generate(self, request: CharacterBackstoryRequest) -> GenerationResponse:
        """Generates a character backstory using AI based on provided character data."""
        
        char = request.character
        logger.info(f"Generating character backstory for {char.name} (ID: {char.id})")
        
        system_prompt = self._load_system_prompt()
        user_prompt = self._build_user_prompt(request)
        
        try:
            response = await self.azure_client.generate_completion(
                system_prompt=system_prompt,
                user_prompt=user_prompt
            )
            
            generated_content = response["text"]
            logger.info(f"Successfully generated character backstory for {char.name}")
            
            return GenerationResponse(
                generated_content=generated_content
            )
            
        except Exception as e:
            logger.error(f"Error generating character backstory: {e}")
            raise


# Singleton instance
character_backstory_service = CharacterBackstoryService()
