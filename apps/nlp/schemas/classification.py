from pydantic import BaseModel, Field
from typing import List, Optional

VALID_SPECIES = ["dog", "cat", "cattle", "monkey", "bird", "other"]
VALID_CATEGORIES = [
    "injury",
    "bite_incident",
    "stray_sighting",
    "sterilization_request",
    "cruelty_report",
    "roadkill",
    "adoption_inquiry",
]

class ClassifyRequest(BaseModel):
    description: str = Field(..., min_length=5, description="Free-text incident description")
    species: str = Field(default="dog", description="Animal species (dog, cat, cattle, monkey, bird, other)")

class CategoryScore(BaseModel):
    category: str
    score: float = Field(..., ge=0.0, le=1.0)

class ClassifyResponse(BaseModel):
    predicted_category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    all_scores: List[CategoryScore]
    species_context: str
