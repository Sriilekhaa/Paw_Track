import os

# Limit memory fragmentation and CPU thread contention for Render 512MB free tier
os.environ["MALLOC_ARENA_MAX"] = "2"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

try:
    import torch
    torch.set_grad_enabled(False)
    torch.set_num_threads(1)
except ImportError:
    pass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from schemas.classification import ClassifyRequest, ClassifyResponse
from schemas.entities import EntityExtractRequest, EntityExtractResponse
from schemas.urgency import UrgencyScoreRequest, UrgencyScoreResponse
from schemas.duplicate import DuplicateCheckRequest, DuplicateCheckResponse
from schemas.pipeline import UnifiedAnalysisRequest, UnifiedAnalysisResponse

from services.classifier import classifier_service
from services.entity_extractor import entity_extractor_service
from services.urgency_scorer import urgency_scorer_service
from services.duplicate_detector import duplicate_detector_service

app = FastAPI(
    title="PawTrack NLP & AI Intelligence Service",
    description="Multi-species text classification, species-aware NER, explainable urgency scoring, and dense semantic duplicate detection for urban animal welfare.",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> Dict[str, Any]:
    """Health check endpoint confirming service and model status."""
    return {
        "status": "ok",
        "service": "PawTrack NLP Microservice",
        "models": {
            "classification": "valhalla/distilbart-mnli-12-3 + domain priors",
            "ner": "spaCy en_core_web_sm + species-aware matcher",
            "sentiment": "distilbert-base-uncased-finetuned-sst-2",
            "embeddings": "all-MiniLM-L6-v2 (384-d)",
        },
    }


@app.post("/classify", response_model=ClassifyResponse)
def classify_report(req: ClassifyRequest) -> ClassifyResponse:
    """Classify free-text report description into one of 7 category enums."""
    try:
        top_cat, conf, scores = classifier_service.classify(
            req.description, species=req.species
        )
        return ClassifyResponse(
            predicted_category=top_cat,
            confidence=conf,
            all_scores=scores,
            species_context=req.species,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@app.post("/extract-entities", response_model=EntityExtractResponse)
def extract_entities(req: EntityExtractRequest) -> EntityExtractResponse:
    """Extract species-aware symptoms, landmarks, locations, conditions, and equipment recommendations."""
    try:
        return entity_extractor_service.extract_entities(
            req.description, species=req.species
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity extraction failed: {str(e)}")


@app.post("/score-urgency", response_model=UrgencyScoreResponse)
def score_urgency(req: UrgencyScoreRequest) -> UrgencyScoreResponse:
    """Compute explainable urgency score (0-1), level, sentiment, and contributing signals."""
    try:
        return urgency_scorer_service.score_urgency(
            req.description, species=req.species, category=req.category
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Urgency scoring failed: {str(e)}")


@app.post("/check-duplicate", response_model=DuplicateCheckResponse)
def check_duplicate(req: DuplicateCheckRequest) -> DuplicateCheckResponse:
    """Compute dense text embeddings and cosine similarity against candidate reports."""
    try:
        return duplicate_detector_service.check_duplicate(
            description=req.description,
            candidates=req.candidates,
            threshold=req.threshold,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duplicate check failed: {str(e)}")


@app.post("/analyze", response_model=UnifiedAnalysisResponse)
def analyze_report(req: UnifiedAnalysisRequest) -> UnifiedAnalysisResponse:
    """
    Unified one-call enrichment endpoint performing classification,
    NER, urgency scoring, dense embedding, and duplicate comparison.
    """
    try:
        # 1. Classification
        top_cat, conf, cat_scores = classifier_service.classify(
            req.description, species=req.species
        )

        # 2. Entity Extraction
        ner_res = entity_extractor_service.extract_entities(
            req.description, species=req.species
        )

        # 3. Urgency & Sentiment Scoring
        urgency_res = urgency_scorer_service.score_urgency(
            req.description, species=req.species, category=req.category or top_cat
        )

        # 4. Embeddings & Duplicate Matching
        dup_res = duplicate_detector_service.check_duplicate(
            description=req.description,
            candidates=req.candidates or [],
            threshold=0.82,
        )

        return UnifiedAnalysisResponse(
            predicted_category=top_cat,
            confidence=conf,
            category_scores=cat_scores,
            entities=ner_res.entities,
            symptoms=ner_res.symptoms,
            locations=ner_res.locations,
            conditions=ner_res.conditions,
            equipment_recommended=ner_res.equipment_recommended,
            urgency_score=urgency_res.urgency_score,
            urgency_level=urgency_res.urgency_level,
            sentiment=urgency_res.sentiment,
            urgency_signals=urgency_res.signals,
            urgency_explanation=urgency_res.explanation,
            is_duplicate=dup_res.is_duplicate,
            top_match=dup_res.top_match,
            duplicate_matches=dup_res.matches,
            embedding=dup_res.embedding,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unified analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
