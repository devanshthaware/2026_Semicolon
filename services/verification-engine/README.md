# TruthLayer Verification Engine

This FastAPI service is the ML/service boundary for TruthLayer. It owns claim extraction, retrieval, entailment, and evidence receipts; the Next.js platform remains responsible for dashboard, auth, keys, and SDK-facing API delivery.

## Run locally

```powershell
cd services/verification-engine
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set `TRUTHLAYER_ENGINE_URL=http://localhost:8000` before starting the platform to use this service.

## Current versus planned implementation

The initial service has a small local corpus, lexical retrieval, and a deterministic NLI adapter so the system is runnable with no model download. Its stable `/v1/verify` contract is designed for these replacement steps:

1. Qdrant dense retrieval + BM25 sparse retrieval + reciprocal-rank fusion
2. Cross-encoder reranking
3. DeBERTa-v3-large-MNLI entailment / contradiction probabilities
4. Semantic entropy, kernel entropy, fusion, and conformal-calibration services

Do not present the current fallback scores as research-grade model results.
