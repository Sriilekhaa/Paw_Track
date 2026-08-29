from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CandidateReport(BaseModel):
    id: str
    description: str
    location: Optional[Dict[str, Any]] = None
    createdAt: Optional[str] = None

class DuplicateMatch(BaseModel):
    id: str
    similarity_score: float = Field(..., ge=-1.0, le=1.0)
    is_duplicate: bool
    snippet: str

class DuplicateCheckRequest(BaseModel):
    description: str = Field(..., min_length=5, description="New report description to check")
    location: Optional[Dict[str, Any]] = None
    candidates: List[CandidateReport] = Field(default=[], description="Candidate reports within geographic radius")
    threshold: float = Field(default=0.82, ge=0.5, le=1.0, description="Cosine similarity threshold for duplication")

class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    similarity_threshold: float
    top_match: Optional[DuplicateMatch] = None
    matches: List[DuplicateMatch]
    embedding: List[float]
