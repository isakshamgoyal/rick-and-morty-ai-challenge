import re
import json
from pathlib import Path
from typing import Dict, Any

from src.integrations.azure_openai_client import azure_openai_client


class LLMJudge:
    """LLM-as-a-judge for optional evaluation metrics."""
    
    def __init__(self):
        self.azure_client = azure_openai_client
    
    async def evaluate_factual_consistency(self, generated: str, source_context: str) -> Dict[str, Any]:
        """Evaluate factual consistency using LLM judge."""
        system_prompt = """You are an expert evaluator. Evaluate if the generated text is factually consistent with the source context. Rate on a scale of 0-1 and provide clear reasoning."""
        
        user_prompt =f"""Evaluate the factual consistency of this generated text:

                        Source Context:
                        {source_context}

                        Generated Text:
                        {generated}

                        Respond ONLY in strict JSON with this exact schema:
                            {{
                            "score": float,   // between 0 and 1
                            "reasoning": "string",
                            "issues": ["string", ...]
                            }}
                    """
        
        response = await self.azure_client.generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_format={"type": "json_object"}
        )
        
        return self._parse_evaluation_response(response["text"])
    
    async def evaluate_creativity(self, generated: str) -> Dict[str, Any]:
        """Evaluate creativity and entertainment value using LLM judge."""
        system_prompt = """You are an expert evaluator for Rick & Morty content. Evaluate creativity, humor, originality, and entertainment value. Rate on a scale of 0-1."""
        
        user_prompt = f"""Evaluate the creativity and entertainment value of this Rick & Morty themed text:

                            {generated}

                            Respond only in JSON:
                                {{
                                "score": float,
                                "reasoning": "string",
                                "strengths": ["string"],
                                "improvements": ["string"]
                                }}
                        """
        
        response = await self.azure_client.generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_format={"type": "json_object"}
        )
        
        return self._parse_evaluation_response(response["text"])
    
   
    def _parse_evaluation_response(self, response_text: str) -> Dict[str, Any]:
        """Parse LLM evaluation response into structured format."""
        try:
            return json.loads(response_text)
        except Exception:
            return {"score": 0.0, "reasoning": "Invalid JSON", "issues": []}


llm_judge = LLMJudge()
