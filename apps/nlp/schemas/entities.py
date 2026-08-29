from pydantic import BaseModel, Field
from typing import List, Optional

class ExtractedEntity(BaseModel):
    text: str
    label: str  # e.g., SYMPTOM, LOCATION, LANDMARK, CONDITION, EQUIPMENT, ANIMAL_BEHAVIOR
    category: str  # High-level category: symptom, location, condition, behavior, equipment
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    start_char: Optional[int] = None
    end_char: Optional[int] = None

class EntityExtractRequest(BaseModel):
    description: str = Field(..., min_length=5, description="Free-text incident description")
    species: str = Field(default="dog", description="Species to enable species-aware NER")

class EntityExtractResponse(BaseModel):
    species: str
    entities: List[ExtractedEntity]
    symptoms: List[str]
    locations: List[str]
    conditions: List[str]
    equipment_recommended: List[str]
