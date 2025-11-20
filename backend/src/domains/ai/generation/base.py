import logging
from abc import ABC, abstractmethod
from pathlib import Path

from src.domains.ai.generation.models import GenerationResponse
from src.integrations.azure_openai_client import azure_openai_client

logger = logging.getLogger(__name__)


class BaseGenerationService(ABC):
    """Base service for AI generation features."""
    
    def __init__(self, prompt_filename: str):
        self.azure_client = azure_openai_client
        self._system_prompt = None
        self.prompt_filename = prompt_filename
    
    def _load_system_prompt(self) -> str:
        """Loads and caches the system prompt from prompts directory."""
        if self._system_prompt is None:
            prompt_path = Path(__file__).parent.parent / "prompts" / self.prompt_filename
            try:
                with open(prompt_path, "r", encoding="utf-8") as f:
                    self._system_prompt = f.read().strip()
                logger.debug(f"Loaded system prompt: {self.prompt_filename}")
            except FileNotFoundError:
                logger.error(f"System prompt file not found: {prompt_path}")
                raise
        return self._system_prompt
    
    @abstractmethod
    def _build_user_prompt(self, request) -> str:
        """Build user prompt from request data. Must be implemented by subclasses."""
        pass
    
    async def generate(self, request) -> GenerationResponse:
        """Generate content using AI based on request data."""
        system_prompt = self._load_system_prompt()
        user_prompt = self._build_user_prompt(request)
        
        try:
            response = await self.azure_client.generate_completion(
                system_prompt=system_prompt,
                user_prompt=user_prompt
            )
            
            generated_content = response["text"]
            logger.info(f"Successfully generated content")
            
            return GenerationResponse(
                generated_content=generated_content
            )
            
        except Exception as e:
            logger.error(f"Error generating content: {e}")
            raise

