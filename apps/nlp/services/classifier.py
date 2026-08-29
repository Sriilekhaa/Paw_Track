import re
from typing import Dict, List, Tuple
from schemas.classification import CategoryScore, VALID_CATEGORIES

# Detailed category hypothesis descriptions for accurate zero-shot semantic matching
CATEGORY_DESCRIPTIONS = {
    "injury": "an injured, wounded, limping, bleeding, or physically hurt animal requiring medical aid",
    "bite_incident": "an animal bite, aggressive attack, snapping, or rabies threat to humans or pets",
    "stray_sighting": "a healthy roaming stray animal sighting without immediate injury or conflict",
    "sterilization_request": "animal birth control, sterilization request, neutering, spaying, or ear tagging",
    "cruelty_report": "intentional animal cruelty, physical abuse, torture, beating, poisoning, or chaining without food",
    "roadkill": "a dead animal body, deceased carcass, or roadkill on the street requiring removal",
    "adoption_inquiry": "animal adoption inquiry, puppy or kitten fostering, rescue shelter intake",
}

# Domain keyword priors for fast deterministic boosting & fallback classification
DOMAIN_KEYWORDS = {
    "bite_incident": [
        r"\bbite\b", r"\bbitten\b", r"\bbiting\b", r"\battack\b", r"\baggressive\b",
        r"\bsnarl\b", r"\bsnapping\b", r"\brabies\b", r"\bfoaming\b", r"\bchased\b"
    ],
    "roadkill": [
        r"\bdead\b", r"\bcarcass\b", r"\broadkill\b", r"\bdeceased\b", r"\bkilled by car\b",
        r"\brun over\b", r"\blifeless\b", r"\bbody lying\b"
    ],
    "cruelty_report": [
        r"\bcruelty\b", r"\bbeat\b", r"\bbeating\b", r"\bpoison\b", r"\bpoisoned\b",
        r"\bpoisoning\b", r"\babuse\b", r"\babusing\b", r"\bchained\b", r"\btied without food\b",
        r"\btorture\b", r"\bstarving\b"
    ],
    "sterilization_request": [
        r"\bsteriliz\w*", r"\bneuter\w*", r"\bspay\w*", r"\babc\b", r"\bbirth control\b",
        r"\bear notch\w*", r"\bpopulation\b", r"\bcatch and neuter\b"
    ],
    "adoption_inquiry": [
        r"\badopt\w*", r"\bfoster\w*", r"\bhome needed\b", r"\blitter for adoption\b",
        r"\brescue shelter\b", r"\blooking for home\b"
    ],
    "injury": [
        r"\binjur\w*", r"\bbleed\w*", r"\bwound\w*", r"\blimp\w*", r"\bfractur\w*",
        r"\bmaggot\w*", r"\bhit by vehicle\b", r"\bhurt\b", r"\bpain\b", r"\bbroken leg\b",
        r"\belectrocute\w*", r"\bentangle\w*", r"\bopen cut\b"
    ],
    "stray_sighting": [
        r"\bstray\b", r"\broaming\b", r"\bwandering\b", r"\bsighted\b", r"\bseen near\b",
        r"\bpack of\b", r"\bhealthy\b", r"\blost dog\b", r"\blost cat\b"
    ],
}


class ReportClassifier:
    def __init__(self):
        self._pipeline = None
        self._initialized = False

    def _lazy_init(self):
        if self._initialized:
            return
        try:
            import os
            from transformers import pipeline
            model_name = os.environ.get("CLASSIFIER_MODEL", "valhalla/distilbart-mnli-12-3")
            # Use small fast zero-shot model for local / free-tier CPU execution
            self._pipeline = pipeline(
                "zero-shot-classification",
                model=model_name,
                device=-1,  # CPU execution
            )
            self._initialized = True
        except Exception as e:
            print(f"⚠️ Zero-shot transformer pipeline init note: {e}. Utilizing semantic keyword priors.")
            self._initialized = True

    def classify(self, description: str, species: str = "dog") -> Tuple[str, float, List[CategoryScore]]:
        self._lazy_init()
        text_lower = description.lower()

        # Step 1: Calculate domain keyword prior scores
        keyword_scores: Dict[str, float] = {cat: 0.05 for cat in VALID_CATEGORIES}
        for cat, patterns in DOMAIN_KEYWORDS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    keyword_scores[cat] += 0.25

        # Step 2: Run HuggingFace Zero-Shot Model if loaded
        hf_scores: Dict[str, float] = {}
        if self._pipeline:
            try:
                candidate_labels = list(CATEGORY_DESCRIPTIONS.values())
                label_to_cat = {desc: cat for cat, desc in CATEGORY_DESCRIPTIONS.items()}
                
                # Contextual prompt with species
                hypothesis_template = f"This report about a {species} describes {{}}."
                result = self._pipeline(
                    description,
                    candidate_labels=candidate_labels,
                    hypothesis_template=hypothesis_template,
                    multi_label=False,
                )

                for label, score in zip(result["labels"], result["scores"]):
                    cat = label_to_cat[label]
                    hf_scores[cat] = float(score)
            except Exception as err:
                print(f"Inference error in zero-shot pipeline: {err}")

        # Step 3: Ensemble keyword priors and neural zero-shot distribution
        final_scores: Dict[str, float] = {}
        for cat in VALID_CATEGORIES:
            neural_val = hf_scores.get(cat, 0.1)
            kw_val = keyword_scores.get(cat, 0.05)
            
            if hf_scores:
                # 65% neural semantic reasoning + 35% domain regex priors
                combined = (neural_val * 0.65) + (kw_val * 0.35)
            else:
                combined = kw_val

            final_scores[cat] = combined

        # Softmax / Normalize scores so sum is 1.0
        total_sum = sum(final_scores.values()) or 1.0
        normalized_scores: List[CategoryScore] = [
            CategoryScore(category=cat, score=round(score / total_sum, 4))
            for cat, score in sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
        ]

        top_category = normalized_scores[0].category
        top_confidence = normalized_scores[0].score

        return top_category, top_confidence, normalized_scores


# Global singleton instance
classifier_service = ReportClassifier()
