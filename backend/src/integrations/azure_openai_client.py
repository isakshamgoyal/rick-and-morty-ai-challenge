import asyncio
import logging
from typing import Dict, Any
from openai import AzureOpenAI

from src.core.config import settings

logger = logging.getLogger(__name__)


class AzureOpenAIClient:
    """Wrapper for Azure OpenAI API client."""
    
    def __init__(self):
        """Initialize Azure OpenAI client."""
        if not settings.AZURE_OPENAI_API_KEY or not settings.AZURE_OPENAI_ENDPOINT:
            raise ValueError("Azure OpenAI client not configured. Set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT")
        
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
        )
        logger.info("Azure OpenAI client initialized")
    
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 500,
        response_format: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """
        Generate a completion using Azure OpenAI.
        
        Args:
            system_prompt: System-level instructions
            user_prompt: User query/input
            temperature: Randomness (0.0-1.0)
            max_tokens: Maximum tokens in response
            response_format: Optional response_format payload (e.g. {"type": "json_object"})
            
        Returns:
            Dict containing response text, usage, and metadata
        """
        try:
            def _create_completion():
                kwargs: Dict[str, Any] = {
                    "model": settings.AZURE_OPENAI_DEPLOYMENT,
                    "messages": [
                    {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if response_format is not None:
                    kwargs["response_format"] = response_format
                return self.client.chat.completions.create(**kwargs)

            response = await asyncio.to_thread(_create_completion)
            
            return {
                "text": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
                "model": response.model,
                "finish_reason": response.choices[0].finish_reason,
            }
            
        except Exception as e:
            logger.error(f"Azure OpenAI API error: {e}")
            raise
    
    async def generate_embedding(
        self,
        text: str,
    ) -> list[float]:
        """Generate an embedding vector for text using Azure OpenAI."""
        try:
            response = await asyncio.to_thread(
                self.client.embeddings.create,
                model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
                input=text
            )
            
            return response.data[0].embedding
            
        except Exception as e:
            logger.error(f"Azure OpenAI embedding error: {e}")
            raise


# Singleton instance
azure_openai_client = AzureOpenAIClient()
