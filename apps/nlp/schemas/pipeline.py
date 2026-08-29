from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .classification import CategoryScore
from .entities import ExtractedEntity
from .urgency import SentimentResult, UrgencySignal
from .duplicate import CandidateReport, DuplicateMatch

class UnifiedAnalysisRequest(BaseModel):
    description: str = Field(..., min_length=5)
    species: str = Field(default="dog")
    category: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    candidates: Optional[List[CandidateReport]] = Field(default=[])

class UnifiedAnalysisResponse(BaseModel):
    # Classification
    predicted_category: str
    confidence: float
    category_scores: List[CategoryScore]

    # Entity Extraction
    entities: List[ExtractedEntity]
    symptoms: List[str]
    locations: List[str]
    conditions: List[str]
    equipment_recommended: List[str]

    # Urgency & Sentiment
    urgency_score: float
    urgency_level: str
    sentiment: SentimentResult
    urgency_signals: List[UrgencySignal]
    urgency_explanation: str

    # Duplicate Detection
    is_duplicate: bool
    top_match: Optional[DuplicateMatch] = None
    duplicate_matches: List[DuplicateMatch]
    embedding: List[float]
