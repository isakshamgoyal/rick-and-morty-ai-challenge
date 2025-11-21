import re
from abc import ABC, abstractmethod
from typing import Dict, Optional, List
import numpy as np

from src.integrations.azure_openai_client import azure_openai_client


class BaseEvaluator(ABC):
    """Base evaluator with shared utilities for all evaluation types."""
    
    def __init__(self):
        self.azure_client = azure_openai_client
    
    async def generate_embedding(self, text: str) -> list[float]:
        """Generate embedding vector for text."""
        return await self.azure_client.generate_embedding(text)
    
    def compute_cosine_similarity(self, vec1: list[float], vec2: list[float]) -> float:
        """Calculate cosine similarity between two embedding vectors."""
        arr1 = np.array(vec1)
        arr2 = np.array(vec2)
        
        dot_product = np.dot(arr1, arr2)
        norm1 = np.linalg.norm(arr1)
        norm2 = np.linalg.norm(arr2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = dot_product / (norm1 * norm2)

        # Scale to 0..1
        scaled = (similarity + 1) / 2

        return float(np.clip(scaled, 0.0, 1.0))

    def calculate_cosine_similarity_word_overlap(self, text1: str, text2: str) -> float:
        """Calculates cosine similarity between two texts using word overlap."""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    async def compute_semantic_alignment(self, generated: str, context: str) -> float:
        """Calculate semantic alignment between generated text and source context."""
        generated_embedding = await self.generate_embedding(generated)
        context_embedding = await self.generate_embedding(context)
        return self.compute_cosine_similarity(generated_embedding, context_embedding)
    
    def calculate_keyword_matches(self, text: str, keywords: List[str]) -> float:
        """Returns normalized keyword match score."""
        if not keywords:
            return 0.0

        text_lower = text.lower()
        found = 0

        for kw in keywords:
            kw = kw.lower()

            if " " in kw:
                # For multi-word phrases (e.g. "dark humor", "portal gun")
                if kw in text_lower:
                    found += 1
            else:
                # Single-word keywords: boundary-safe
                if re.search(rf"\b{re.escape(kw)}\b", text_lower):
                    found += 1

        return min(1.0, found / max(3, len(keywords) // 2))

    @abstractmethod
    async def evaluate(self, generated: str, metadata: Dict) -> Dict[str, float]:
        """Evaluate generated output and return metrics."""
        pass