from pydantic import BaseModel, Field
from typing import List, Optional

class UrgencySignal(BaseModel):
    name: str
    weight: float
    matched_text: str
    signal_type: str  # keyword, sentiment, species_modifier, category_modifier

class SentimentResult(BaseModel):
    label: str  # NEGATIVE, POSITIVE, NEUTRAL
    score: float = Field(..., ge=0.0, le=1.0)

class UrgencyScoreRequest(BaseModel):
    description: str = Field(..., min_length=5, description="Free-text incident description")
    species: str = Field(default="dog", description="Animal species")
    category: Optional[str] = Field(default=None, description="Optional incident category")

class UrgencyScoreResponse(BaseModel):
    urgency_score: float = Field(..., ge=0.0, le=1.0, description="Urgency score normalized between 0.0 and 1.0")
    urgency_level: str = Field(..., description="Categorical level: low, medium, high, critical")
    sentiment: SentimentResult
    signals: List[UrgencySignal]
    explanation: str
