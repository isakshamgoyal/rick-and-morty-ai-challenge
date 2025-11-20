import re
from typing import Dict

from src.domains.ai.evaluation.base import BaseEvaluator
from src.domains.ai.utils import contains_exact

class LocationAdventureEvaluator(BaseEvaluator):
    """Evaluator for location adventure story generation."""
    
    async def evaluate(
        self,
        generated: str,
        metadata: Dict,
    ) -> Dict[str, float]:
        """Evaluate location adventure story generation."""
        metrics = {}
        location = metadata.get("location")
        if not location:
            return metrics
        
        factual_consistency = self.compute_factual_consistency(generated, location)
        metrics["factual_consistency"] = factual_consistency

        tone_score = self.compute_tone_score(generated)
        metrics["tone_style"] = tone_score
        
        resident_relevance = self.compute_resident_relevance(generated, location)
        metrics["resident_relevance"] = resident_relevance
        
        narrative_relevance = self.compute_narrative_relevance_location(generated, location)
        metrics["narrative_relevance"] = narrative_relevance
        
        coherence = self.compute_narrative_coherence(generated)
        metrics["narrative_coherence"] = coherence
        return metrics
    
    def compute_factual_consistency(self, generated: str, location) -> float:
        """Improved factual consistency score using safer matching and better resident logic."""
        
        if not generated or not location:
            return 0.0
        
        text = generated.lower()
        score, total_weight = 0.0, 0.0        

        checks = {
            "name": (0.30, location.name),
            "type": (0.15, location.type),
            "dimension": (0.15, location.dimension),
        }

        for _, (weight, value) in checks.items():
            if value:
                if contains_exact(text, value):
                    score += weight
                elif value.lower() in text:
                    score += weight * 0.6
            total_weight += weight

        # --- Residents ---
        residents = location.residents or []
        if residents and len(residents) > 0:
            names = [
                getattr(r, "name", None) or r.get("name")
                for r in residents
                if (getattr(r, "name", None) or r.get("name"))
            ]
            names = [n.lower() for n in names]

            mentioned = sum(1 for name in names if contains_exact(name, text))

            # Scoring: 0 → 0, 1 → 0.10, 2+ → 0.20
            resident_score = 0.20 if mentioned >= 2 else (0.10 if mentioned == 1 else 0.0)

            score += resident_score
            total_weight += 0.20

        # --- Contradiction penalty ---
        contradiction_phrases = [
            "not actually", "never existed", "incorrectly",
            "wasn't really", "fake", "contradiction", 
            "inaccurate", "not true", "but in reality"
        ]

        if any(p in text for p in contradiction_phrases):
            score *= 0.8  # soften score by 20%

        if total_weight == 0:
            return 0.0
        
        return 0.0 if total_weight == 0 else min(1.0, score / total_weight)
    
    def compute_tone_score(self, text: str) -> float:
        """Improved Rick & Morty tone/style scoring with weighted keyword groups."""
        
        text_lower = text.lower()

        # Sci-fi / multiverse markers (40%)
        sci_fi_markers = [
            "portal", "dimension", "multiverse", "universe", "interdimensional",
            "galaxy", "cosmic", "quantum", "timeline", "anomaly", "portal gun"
        ]

        # Humor / attitude markers (35%)
        humor_markers = [
            "sarcasm", "sarcastic", "cynical", "absurd", "dark humor",
            "messed up", "jeez", "oh man", "screw it", "what the hell",
            "ridiculous", "chaotic"
        ]

        # Character / world references (25%)
        world_markers = [
            "rick", "morty", "smith", "c-137", "council of ricks",
            "citadel of ricks", "schwifty", "wubba lubba dub dub"
        ]

        return (
            0.40 * self.calculate_keyword_matches(text_lower, sci_fi_markers) +
            0.35 * self.calculate_keyword_matches(text_lower, humor_markers) +
            0.25 * self.calculate_keyword_matches(text_lower, world_markers)
        )
    
    def compute_resident_relevance(self, text: str, location) -> float:
        """Measures how strongly the adventure story involves location residents."""
    
        residents = location.residents or []
        if not residents:
            return 0.0

        text_lower = text.lower()

        # Extract resident names safely
        names = [
            (getattr(r, "name", None) or r.get("name")).lower()
            for r in residents
            if (getattr(r, "name", None) or r.get("name"))
        ]

        # Count how many residents show up
        mentioned = sum(name in text_lower for name in names)

        # 0 residents → 0.0, 1 resident → 0.5, 2+ residents → 1.0
        return 0.0 if mentioned == 0 else (0.5 if mentioned == 1 else 1.0)
    
    def compute_narrative_relevance_location(self, text: str, location) -> float:
        """Determine if the story is actually an adventure at the location."""
        
        if not text or not location:
            return 0.0
        
        text_lower = text.lower()
        score = 0.0

        # 1. Location groundedness (40%)
        location_name = location.name.lower() if location.name else ""
        
        if location_name and location_name in text_lower:
            score += 0.40

        # 2. Adventure / action markers (40%)
        adventure_markers = [
            "adventure", "journey", "quest", "mission",
            "explore", "explored", "discover", "discovered",
            "encountered", "battled", "fought", "escaped",
            "chased", "danger", "chaos", "threat", "pursued"
        ]

        has_adventure = any(marker in text_lower for marker in adventure_markers)
        if has_adventure:
            score += 0.40

        # 3. Resident involvement (20%) — simple presence check
        residents = location.residents or []
        if residents:
            resident_names = [
                (getattr(r, "name", None) or r.get("name")).lower()
                for r in residents
                if (getattr(r, "name", None) or r.get("name"))
            ]
            if any(name in text_lower for name in resident_names):
                score += 0.20

        return min(1.0, score)


    def compute_narrative_coherence(self, text: str) -> float:
        """Narrative coherence scoring for location-based adventure stories."""
        
        if not text or len(text.strip()) < 30:
            return 0.1

        text_lower = text.lower()

        # Sentence parsing
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
        num_sentences = len(sentences)

        if num_sentences < 3:
            return 0.2

        score = 0.4  # baseline

        # Adventure relies heavily on transitions and action flow
        transition_words = [
            "then", "after", "next", "meanwhile",
            "suddenly", "later", "eventually", 
            "without warning", "in response", "as they continued"
        ]

        transitions_found = sum(1 for w in transition_words if w in text_lower)
        
        if transitions_found >= 3:
            score += 0.25  # higher weight for adventures
        elif transitions_found == 2:
            score += 0.18
        elif transitions_found == 1:
            score += 0.10

        # Detect action verbs (important in adventures)
        action_verbs = [
            "ran", "fought", "escaped", "jumped", "attacked",
            "hid", "chased", "explored", "battled", "discovered"
        ]

        action_count = sum(1 for word in action_verbs if word in text_lower)

        if action_count >= 3:
            score += 0.20
        elif action_count >= 1:
            score += 0.10

        # Choppy starts penalty
        choppy_starts = sum(
            1 for s in sentences 
            if s.lower().startswith(("and ", "but ", "so "))
        )

        if choppy_starts > num_sentences * 0.3:
            score -= 0.12
        elif choppy_starts > num_sentences * 0.2:
            score -= 0.08

        # Internal contradiction penalty
        contradiction_indicators = [
            "for no reason", "out of nowhere",
            "but suddenly without explanation",
            "but then suddenly with no reason"
        ]

        if any(phrase in text_lower for phrase in contradiction_indicators):
            score -= 0.10

        return max(0.0, min(1.0, score))
