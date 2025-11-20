import logging
from typing import Dict

from src.domains.ai.evaluation.base import BaseEvaluator
from src.domains.ai.evaluation.models import EvaluationRequest, EvaluationResponse
from src.domains.ai.evaluation.llm_judge import llm_judge

logger = logging.getLogger(__name__)


class EvaluationService:
    """Generic service for orchestrating AI generation evaluation."""
    
    def __init__(self):
        pass
    
    async def evaluate(
        self,
        evaluator: BaseEvaluator,
        weights: Dict[str, float],
        request: EvaluationRequest,
        source_context: str = "",
        use_llm_judge: bool = False,
    ) -> EvaluationResponse:
        """Evaluate generated output using provided evaluator and weights."""
        
        metrics = await evaluator.evaluate(
            generated=request.generated_output,
            metadata=request.metadata or {},
        )
        
        if source_context:
            semantic_alignment = await evaluator.compute_semantic_alignment(
                request.generated_output, source_context
            )
            metrics["semantic_alignment"] = semantic_alignment
        
        if request.expected_output_embeddings:
            generated_embedding = await evaluator.generate_embedding(request.generated_output)
            cosine_similarity = evaluator.compute_cosine_similarity(
                generated_embedding, request.expected_output_embeddings
            )
            metrics["cosine_similarity"] = cosine_similarity
        
        normalized_weights = self._normalize_weights(weights, "cosine_similarity" in metrics)
        metrics["overall_score"] = self._calculate_weighted_score(metrics, normalized_weights)
        
        llm_judge_results = {}
        if use_llm_judge:
            llm_judge_results = await self._get_llm_judge_scores(request, source_context)
        
        return EvaluationResponse(
            evaluation_metrics=metrics,
            llm_judge_metrics=llm_judge_results,
            generated_output=request.generated_output,
            expected_output=request.expected_output,
        )
    
    def _normalize_weights(self, weights: Dict[str, float], has_cosine_similarity: bool) -> Dict[str, float]:
        """Normalize weights based on whether cosine_similarity metric exists."""
        weights = weights.copy()
        
        if has_cosine_similarity:
            if "cosine_similarity" not in weights:
                weights["cosine_similarity"] = 0.25
                total_existing_weight = sum(v for k, v in weights.items() if k != "cosine_similarity")
                if total_existing_weight > 0:
                    scale_factor = 0.75 / total_existing_weight
                    weights = {k: v * scale_factor if k != "cosine_similarity" else v 
                              for k, v in weights.items()}
        else:
            weights.pop("cosine_similarity", None)
            total_weight = sum(weights.values())
            if total_weight > 0:
                weights = {k: v / total_weight for k, v in weights.items()}
        
        return weights
    
    def _calculate_weighted_score(self, metrics: Dict[str, float], weights: Dict[str, float]) -> float:
        """Calculate weighted overall score from metrics."""
        total_score = 0.0
        total_weight = 0.0
        
        for metric_name, weight in weights.items():
            if metric_name in metrics:
                total_score += metrics[metric_name] * weight
                total_weight += weight
        
        if total_weight == 0:
            return 0.0
        
        return total_score / total_weight
    
    async def _get_llm_judge_scores(self, request: EvaluationRequest, source_context: str) -> Dict:
        """Get optional LLM judge scores."""
        factual_consistency = await llm_judge.evaluate_factual_consistency(
            generated=request.generated_output,
            source_context=source_context
        )
        
        creativity = await llm_judge.evaluate_creativity(
            generated=request.generated_output
        )
        
        return {
            "factual_consistency": factual_consistency,
            "creativity": creativity
        }


evaluation_service = EvaluationService()
