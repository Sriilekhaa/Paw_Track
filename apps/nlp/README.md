# PAW TRACK — NLP & AI Intelligence Service (`apps/nlp`)

> **Status:** Placeholder Service (Planned for subsequent milestone)

## Overview
This directory is reserved for the future **Python / FastAPI** microservice that will handle:
- Automated species and incident classification from text descriptions.
- Urgency scoring and sentiment analysis.
- Entity extraction (location landmarks, animal condition markers, contact cues).
- Text embeddings generation for semantic duplicate detection (`isDuplicate`, `originalReport`).
- Computer vision integration for animal detection bounding boxes and injury assessments.

## Planned Stack
- **Framework:** FastAPI (Python 3.11+)
- **ML / NLP Libraries:** Hugging Face Transformers, RoBERTa / DeBERTa, Sentence-Transformers, PyTorch
- **API Integration:** Asynchronous worker queue / Webhook events from `apps/api`.
