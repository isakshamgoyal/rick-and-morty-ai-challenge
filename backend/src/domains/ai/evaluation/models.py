from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class EvaluationRequest(BaseModel):
    generated_output: str
    expected_output: Optional[str] = None
    expected_output_embeddings: Optional[list[float]] = None
    metadata: Optional[Dict[str, Any]] = None


class EvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    evaluation_metrics: Dict[str, float]
    llm_judge_metrics: Optional[Dict[str, Any]] = None
    generated_output: str
    expected_output: Optional[str] = None

