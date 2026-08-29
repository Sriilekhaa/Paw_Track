import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "models" in data


def test_classify_injury():
    payload = {
        "description": "Found a stray dog bleeding heavily from a broken leg after being hit by a car.",
        "species": "dog",
    }
    response = client.post("/classify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_category"] == "injury"
    assert data["confidence"] > 0.3
    assert len(data["all_scores"]) == 7


def test_classify_bite_incident():
    payload = {
        "description": "Aggressive street dog attacked and bit a delivery boy on the leg.",
        "species": "dog",
    }
    response = client.post("/classify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_category"] == "bite_incident"


def test_extract_entities_species_aware_cattle():
    payload = {
        "description": "Stray cow with bloated stomach eating plastic waste blocking highway traffic near toll booth.",
        "species": "cattle",
    }
    response = client.post("/extract-entities", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["species"] == "cattle"
    # Verify species-specific cattle entity and equipment
    assert any("Rumen Impaction" in sym or "Bloat" in sym for sym in data["symptoms"])
    assert any("Traffic" in cond or "Obstruction" in cond for cond in data["conditions"])
    assert "Cattle Transport Hydraulic Crane" in data["equipment_recommended"]


def test_extract_entities_species_aware_dog():
    payload = {
        "description": "Stray dog foaming at mouth and barking aggressively near Sector 15 park gate.",
        "species": "dog",
    }
    response = client.post("/extract-entities", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["species"] == "dog"
    assert any("Rabies" in sym or "Foam" in sym for sym in data["symptoms"])
    assert "Catch Pole & Safety Shield" in data["equipment_recommended"]


def test_score_urgency_explainable():
    payload = {
        "description": "Critical emergency: dog hit by vehicle, unconscious and severe bleeding.",
        "species": "dog",
        "category": "injury",
    }
    response = client.post("/score-urgency", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency_score"] >= 0.70
    assert data["urgency_level"] in ["high", "critical"]
    assert len(data["signals"]) > 0
    # Verify explainability structure
    assert "signal_type" in data["signals"][0]
    assert "explanation" in data


def test_check_duplicate_similarity():
    payload = {
        "description": "Brown dog with bleeding left leg near sector 15 park.",
        "candidates": [
            {
                "id": "rep-001",
                "description": "Injured brown dog limping and bleeding from front leg outside sector 15 park gate.",
            },
            {
                "id": "rep-002",
                "description": "White cat sleeping peacefully in garden.",
            },
        ],
        "threshold": 0.72,
    }
    response = client.post("/check-duplicate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_duplicate"] is True
    assert data["top_match"]["id"] == "rep-001"
    assert data["top_match"]["similarity_score"] > 0.75
    assert len(data["embedding"]) == 384


def test_unified_analyze_pipeline():
    payload = {
        "description": "Pigeon with broken wing tangled in sharp kite string on banyan tree near school.",
        "species": "bird",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_category"] == "injury"
    assert "Ventilated Avian Carrier" in data["equipment_recommended"]
    assert data["urgency_score"] > 0.0
    assert len(data["embedding"]) == 384
