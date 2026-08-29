import re
from typing import List, Tuple, Optional
from schemas.urgency import UrgencyScoreResponse, UrgencySignal, SentimentResult

# Weighted urgency signal indicators
URGENCY_KEYWORDS = [
    # Critical Tier (Weight: 0.35 - 0.45)
    (r"\b(dying|critical|fatal|unconscious|unresponsive|comatose)\b", 0.45, "Life-Threatening Vital Crisis", "keyword"),
    (r"\b(rabid|foaming at (?:the )?mouth|rabies)\b", 0.45, "Suspected Rabies Public Biohazard", "keyword"),
    (r"\b(hit by (?:car|truck|bus|train|vehicle)|run over|crushed)\b", 0.40, "High-Impact Vehicular Trauma", "keyword"),
    (r"\b(electrocute\w*|high voltage|wire shock|burning)\b", 0.40, "Electrical Burn / Shock Hazard", "keyword"),
    (r"\b(poison\w*|vomiting blood|toxic)\b", 0.40, "Suspected Acute Poisoning", "keyword"),
    (r"\b(severe bleeding|blood pouring|haemorrhag\w*|arterial)\b", 0.38, "Acute Severe Hemorrhage", "keyword"),
    
    # High Tier (Weight: 0.20 - 0.30)
    (r"\b(fractur\w*|broken (?:leg|bone|wing|horn)|bone protruding)\b", 0.30, "Structural Bone / Wing Fracture", "keyword"),
    (r"\b(maggot\w*|rotting wound|flesh exposed|deep wound)\b", 0.28, "Necrotic Maggot Infestation", "keyword"),
    (r"\b(aggressive bite|attacked human|child bitten|bitten)\b", 0.30, "Human Bite Attack / Active Conflict", "keyword"),
    (r"\b(expressway|highway divider|blocked highway|heavy traffic)\b", 0.25, "Highway Collision Risk", "keyword"),
    (r"\b(cruelty|beaten with rod|torture\w*|hanging)\b", 0.30, "Active Physical Cruelty", "keyword"),

    # Medium Tier (Weight: 0.10 - 0.18)
    (r"\b(limping|swollen|abscess|in pain|crying)\b", 0.18, "Moderate Pain / Mobility Issue", "keyword"),
    (r"\b(trapped|stuck in|fallen into drain|well)\b", 0.18, "Physical Entrapment", "keyword"),
    (r"\b(puppies without mother|abandoned kittens|fledgling)\b", 0.15, "Vulnerable Neonatal Care", "keyword"),
    (r"\b(dehydrat\w*|starv\w*|very weak|malnourished)\b", 0.14, "Severe Dehydration / Starvation", "keyword"),
]


class UrgencyScorer:
    def __init__(self):
        self._sentiment_pipeline = None
        self._initialized = False

    def _lazy_init(self):
        if self._initialized:
            return
        try:
            from transformers import pipeline
            self._sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2",
                device=-1,
            )
            self._initialized = True
        except Exception as e:
            print(f"⚠️ Sentiment pipeline note: {e}. Utilizing heuristic sentiment analysis.")
            self._initialized = True

    def _get_sentiment(self, text: str) -> SentimentResult:
        self._lazy_init()
        if self._sentiment_pipeline:
            try:
                res = self._sentiment_pipeline(text[:512])[0]
                label = res["label"]
                score = float(res["score"])
                return SentimentResult(label=label, score=round(score, 4))
            except Exception as err:
                print(f"Sentiment inference error: {err}")

        # Heuristic fallback sentiment
        negative_words = ["pain", "blood", "hurt", "attack", "dead", "bite", "severe", "crying", "dying", "suffering"]
        count = sum(1 for w in negative_words if w in text.lower())
        if count >= 2:
            return SentimentResult(label="NEGATIVE", score=0.92)
        elif count == 1:
            return SentimentResult(label="NEGATIVE", score=0.75)
        return SentimentResult(label="POSITIVE", score=0.60)

    def score_urgency(
        self, description: str, species: str = "dog", category: Optional[str] = None
    ) -> UrgencyScoreResponse:
        text_lower = description.lower()
        matched_signals: List[UrgencySignal] = []
        raw_score = 0.10  # Base triage score

        # 1. Evaluate keyword urgency signals
        for pattern, weight, signal_name, sig_type in URGENCY_KEYWORDS:
            match = re.search(pattern, text_lower)
            if match:
                matched_text = match.group(0)
                raw_score += weight
                matched_signals.append(
                    UrgencySignal(
                        name=signal_name,
                        weight=weight,
                        matched_text=matched_text,
                        signal_type=sig_type,
                    )
                )

        # 2. Sentiment adjustment
        sentiment_res = self._get_sentiment(description)
        if sentiment_res.label == "NEGATIVE" and sentiment_res.score > 0.85:
            sentiment_weight = 0.12
            raw_score += sentiment_weight
            matched_signals.append(
                UrgencySignal(
                    name="High Distress Sentiment Polarity",
                    weight=sentiment_weight,
                    matched_text=f"Distress confidence {int(sentiment_res.score * 100)}%",
                    signal_type="sentiment",
                )
            )

        # 3. Category prior modifier
        if category:
            cat_lower = category.lower()
            if cat_lower in ["bite_incident", "roadkill"]:
                cat_weight = 0.15
                raw_score += cat_weight
                matched_signals.append(
                    UrgencySignal(
                        name=f"Category Priority Modifier ({category})",
                        weight=cat_weight,
                        matched_text=category,
                        signal_type="category_modifier",
                    )
                )
            elif cat_lower in ["injury", "cruelty_report"]:
                cat_weight = 0.10
                raw_score += cat_weight
                matched_signals.append(
                    UrgencySignal(
                        name=f"Category Priority Modifier ({category})",
                        weight=cat_weight,
                        matched_text=category,
                        signal_type="category_modifier",
                    )
                )

        # 4. Species hazard modifier (e.g. cattle in traffic, dog bite)
        if species.lower() == "cattle" and ("road" in text_lower or "highway" in text_lower or "expressway" in text_lower):
            raw_score += 0.15
            matched_signals.append(
                UrgencySignal(
                    name="Expressway Cattle Collision Hazard",
                    weight=0.15,
                    matched_text="Cattle on roadway",
                    signal_type="species_modifier",
                )
            )

        # Normalize score between 0.05 and 0.99
        final_score = min(0.99, max(0.05, round(raw_score, 2)))

        # Categorical Level Mapping
        if final_score >= 0.75:
            level = "critical"
            summary_desc = "Critical Emergency: Immediate Rapid Dispatch Required"
        elif final_score >= 0.50:
            level = "high"
            summary_desc = "High Priority: Scheduled for Prompt Same-Day Field Intervention"
        elif final_score >= 0.25:
            level = "medium"
            summary_desc = "Medium Priority: Standard Operational Queue"
        else:
            level = "low"
            summary_desc = "Low Priority / Routine Monitoring"

        # Natural language explainable justification
        top_signals_str = ", ".join([s.name for s in matched_signals[:3]]) or "No severe acute trauma markers identified"
        explanation = f"{summary_desc}. Identified contributing indicators: {top_signals_str}."

        return UrgencyScoreResponse(
            urgency_score=final_score,
            urgency_level=level,
            sentiment=sentiment_res,
            signals=matched_signals,
            explanation=explanation,
        )


# Global singleton instance
urgency_scorer_service = UrgencyScorer()
