import re
from typing import Dict

from src.domains.ai.evaluation.base import BaseEvaluator
from src.domains.ai.utils import contains_exact


class CharacterBackstoryEvaluator(BaseEvaluator):
    """Evaluator for character backstory generation."""
    
    async def evaluate(
        self,
        generated: str,
        metadata: Dict,
    ) -> Dict[str, float]:
        """Evaluate character backstory generation."""
        
        metrics = {}
        character = metadata.get("character")
        if not character:
            return metrics
        
        factual_consistency = self.compute_factual_consistency(generated, character)
        metrics["factual_consistency"] = factual_consistency
        
        tone_score = self.compute_tone_score(generated)
        metrics["tone_style"] = tone_score

        coherence = self.compute_narrative_coherence(generated)
        metrics["narrative_coherence"] = coherence

        narrative_relevance = self.compute_narrative_relevance_character(generated, character)
        metrics["narrative_relevance"] = narrative_relevance

        return metrics
    
    def compute_factual_consistency(self, generated: str, character) -> float:
        """Improved factual consistency score using safer matching and partial credit."""
        
        if not generated or not character:
            return 0.0

        text = generated.lower()
        score, total_weight = 0.0, 0.0

        checks = {
            "name":     (0.20, character.name),
            "species":  (0.15, character.species),
            "status":   (0.15, character.status),
            "gender":   (0.10, character.gender)
        }

        for _, (weight, value) in checks.items():
            if value:
                if contains_exact(text, value):
                    score += weight
                elif value.lower() in text:
                    score += weight * 0.6  # partial credit
                total_weight += weight

        # --- Origin location ---
        origin_name = character.origin.name.lower()
        if contains_exact(text, origin_name):
            score += 0.10
        total_weight += 0.10

        # --- Current location ---
        location_name = character.location.name.lower()
        if contains_exact(text, location_name):
            score += 0.10
        total_weight += 0.10

        # --- Contradiction penalty ---
        contradiction_phrases = [
            "not actually", "never existed", "incorrectly",
            "wasn't really", "fake", "contradiction", 
            "inaccurate", "not true", "but in reality"
        ]
        if any(p in text for p in contradiction_phrases):
            score *= 0.8 # soften score by 20%

        return 0.0 if total_weight == 0 else min(1.0, score / total_weight)

    
    def compute_tone_score(self, text: str) -> float:
        """Weighted Rick & Morty tone scoring for character backstories."""
    
        text_lower = text.lower()
        print(text_lower)

        # 1. Sci-fi / multiverse markers (30%)
        sci_fi_markers = [
            "portal", "dimension", "multiverse", "universe", "interdimensional",
            "quantum", "galaxy", "timeline", "rift", "anomaly"
        ]

        # 2. Humor / cynicism markers (40%)
        humor_markers = [
            "sarcasm", "sarcastic", "cynical", "absurd", "dark humor", 
            "messed up", "oh man", "jeez", "this is crazy", "what the hell",
            "chaotic", "ridiculous"
        ]

        # 3. Rick & Morty world references (30%)
        world_markers = [
            "rick", "morty", "smith", "c-137", "portal gun", 
            "citadel", "council of ricks", "ricks"
        ]

        print(self.calculate_keyword_matches(text_lower, sci_fi_markers))
        print(self.calculate_keyword_matches(text_lower, humor_markers))
        print(self.calculate_keyword_matches(text_lower, world_markers))    

        return (
            0.30 * self.calculate_keyword_matches(text_lower, sci_fi_markers)
            + 0.40 * self.calculate_keyword_matches(text_lower, humor_markers)
            + 0.30 * self.calculate_keyword_matches(text_lower, world_markers)
        )
    
    def compute_narrative_relevance_character(self, text: str, character) -> float:
        """Check if the generated text is a meaningful backstory of the character."""
        
        if not text or not character:
            return 0.0

        text_lower = text.lower()
        score = 0.0

        # 1. Character grounding (25%)
        if contains_exact(text_lower, character.name):
            score += 0.25

        # 2. Backstory components (55% total → 5 components * 11%)
        components = {
            "origin": [
                "was born", "born", "grew up", "origin", "raised", 
                "came from", "started", "in his early life", "in her early life"
            ],
            "journey": [
                "became", "transformed", "changed", "evolved", 
                "path", "journey", "struggled", "learned"
            ],
            "events": [
                "event", "incident", "encountered", "experienced", 
                "witnessed", "trauma", "accident"
            ],
            "turning_point": [
                "because", "due to", "led to", "resulted in",
                "motivated", "inspired", "explains why"
            ],
            "present": [
                "now", "currently", "today", "remains", "ended up", 
                "has become", "finds himself", "finds herself"
            ]
        }

        found_components = 0
        for markers in components.values():
            if any(m in text_lower for m in markers):
                found_components += 1

        # 5 components → max 0.55
        score += (found_components / len(components)) * 0.55

        # 3. Optional small bonus (20%) for "deep context"
        deep_context_markers = ["influenced", "shaped", "defined", "marked by", "backstory"]
        if any(m in text_lower for m in deep_context_markers):
            score += 0.20  # optional, capped later

        return min(1.0, score)


    def compute_narrative_coherence(self, text: str) -> float:
        """Improved heuristic scoring for narrative coherence."""

        text_lower = text.lower()

        # --- Sentence parsing ---
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
        num_sentences = len(sentences)

        # If too short, coherence can't be strong
        if num_sentences < 3:
            return 0.2

        score = 0.4  # baseline

        # --- Structure: Beginning / Middle / End ---
        beginning_indicators = [
            "was born", "grew up", "began", "started", "originally", 
            "in the beginning", "at first"
        ]

        ending_indicators = [
            "in the end", "eventually", "finally", 
            "now", "today", "currently"
        ]

        has_beginning = any(phrase in text_lower[:250] for phrase in beginning_indicators)
        has_end = any(phrase in text_lower[-250:] for phrase in ending_indicators)

        if has_beginning:
            score += 0.15
        if has_end:
            score += 0.15

        # --- Transitions between sentences ---
        transition_words = [
            "then", "after", "next", "meanwhile", 
            "suddenly", "eventually", "later", "however"
        ]

        transitions = sum(1 for w in transition_words if w in text_lower)
        if transitions >= 2:
            score += 0.15
        elif transitions == 1:
            score += 0.10

        # --- Logical flow check (no abrupt topic jumps) ---
        # If many sentences start with "And", "But", "So", it's choppy
        choppy_starts = sum(
            1 for s in sentences 
            if s.lower().startswith(("and ", "but ", "so "))
        )
        if choppy_starts > num_sentences * 0.3:
            score -= 0.1  # penalize choppy flow

        # --- Internal contradiction heuristic ---
        contradiction_indicators = [
            "but then suddenly without reason",
            "for no reason",
            "randomly",
            "out of nowhere"
        ]
        if any(phrase in text_lower for phrase in contradiction_indicators):
            score -= 0.1

        # Cap the score
        return max(0.0, min(1.0, score))
