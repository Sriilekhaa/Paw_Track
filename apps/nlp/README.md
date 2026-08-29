# PawTrack NLP & AI Intelligence Service 🤖🐾

A production-grade Python/FastAPI microservice providing multi-species incident text classification, species-aware Named Entity Recognition (NER), explainable urgency & sentiment scoring, and dense semantic duplicate detection for urban animal welfare.

---

## 🚀 Key Capabilities

### 1. Multi-Species Report Classification (`POST /classify`)
- Uses Hugging Face `valhalla/distilbart-mnli-12-3` zero-shot transformer ensembled with domain semantic keyword priors.
- Classifies descriptions into 7 categories: `injury`, `bite_incident`, `stray_sighting`, `sterilization_request`, `cruelty_report`, `roadkill`, `adoption_inquiry`.
- **Accuracy: `91.67%`** | **Macro F1: `0.9162`** across a 180-sample multi-species benchmark.

### 2. Species-Aware Domain NER (`POST /extract-entities`)
- Uses spaCy `en_core_web_sm` integrated with tailored token and domain phrase dictionaries.
- **Species-Specific Differentiators:**
  - **Cattle:** Specializes in rumen impaction (plastic bloat), expressway obstruction hazards, ear tags, and foot-and-mouth sores.
  - **Dogs:** Rabies indicators (mouth foaming), aggression markers, collar/tag identifiers, and puppy litters.
  - **Cats:** Feral colony markers, TNR ear notches, entrapments (engine bonnets/trees), and kitten distress.
  - **Monkeys & Birds:** High-voltage wire electrocution, kite string (manja) wing lacerations, and grounded fledglings.
- Generates tailored equipment recommendations (e.g. Catch Pole, Hydraulic Crane, Avian Carrier, Antiseptic Spray).

### 3. Explainable Urgency & Sentiment Scoring (`POST /score-urgency`)
- Combines DistilBERT sentiment polarity with clinical severity weights.
- Returns normalized score (0.0 - 1.0), urgency level (`low`, `medium`, `high`, `critical`), and explicit contributing signals for frontend transparency.

### 4. Semantic Duplicate Detection (`POST /check-duplicate`)
- Generates 384-dimensional dense vectors using `sentence-transformers/all-MiniLM-L6-v2`.
- Compares candidates within geographic proximity using cosine similarity.
- **Optimal Threshold: `0.70 - 0.72`** (Precision: `100.00%`, F1-Score: `0.7879` on 80-pair benchmark).

### 5. Unified Analysis Pipeline (`POST /analyze`)
- Single-request endpoint combining classification, NER, urgency scoring, dense embedding, and duplicate verification for the Node.js Express backend.

---

## 📊 Evaluation Benchmarks

Evaluation results are committed in [`evaluation/results/EVALUATION_REPORT.md`](evaluation/results/EVALUATION_REPORT.md) and [`evaluation/results/classification_metrics.json`](evaluation/results/classification_metrics.json).

| Task | Metric | Value |
|---|---|---|
| **Classification Accuracy** | Overall Accuracy | **`91.67%`** |
| **Classification Macro F1** | Macro F1-Score | **`0.9162`** |
| **Classification Weighted F1**| Weighted F1-Score | **`0.9161`** |
| **Duplicate Precision (0.70)** | Precision | **`100.00%`** |
| **Duplicate F1 (0.70)** | F1-Score | **`0.7879`** |

### Reproducing Evaluations
```bash
# 1. Run Classification Evaluation
./.venv/bin/python evaluation/evaluate_classifier.py

# 2. Run Duplicate Benchmark
./.venv/bin/python evaluation/evaluate_duplicates.py

# 3. Generate Markdown Benchmark Report
./.venv/bin/python evaluation/generate_report.py
```

---

## 🧪 Running Tests & Service

```bash
# Activate virtual environment
source .venv/bin/activate

# Run Pytest suite
pytest tests/ -v

# Run FastAPI Server (port 8000)
python main.py
```
