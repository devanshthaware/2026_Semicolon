# Argus Backend Ecosystem

This is the implementation map for the V1–V4 architecture. It intentionally separates transport and product concerns from the verification science.

```text
Next.js platform / SDK
        │
        ▼
FastAPI verification engine
 ├── claim extraction
 ├── retrieval: BM25 + dense vectors + RRF (Qdrant target)
 ├── NLI: DeBERTa MNLI adapter
 ├── semantic entropy: multi-sample semantic clustering
 ├── kernel language entropy: semantic-kernel von Neumann entropy
 ├── semantic entropy probe: local-model hidden-state adapter
 ├── fusion: trained LightGBM/XGBoost target
 └── conformal prediction: calibrated interval adapter
        │
        ├── PostgreSQL: organizations, keys, receipts, usage
        └── Qdrant: evidence embeddings
```

## What runs today

The engine is functional in a lightweight local mode:

- atomic sentence claim extraction;
- seed-corpus lexical retrieval;
- deterministic lexical NLI fallback;
- explicit fusion fallback;
- actual semantic-entropy and KLE formulas when multiple samples are supplied;
- asynchronous per-claim orchestration;
- stable receipts, evidence, diagnostics, and degradation reporting.

The platform delegates to it when `ARGUS_ENGINE_URL` is set. Otherwise, it uses the platform’s development fallback to keep UI/SDK work unblocked.

## Model-backed deployment

Install `requirements-ml.txt` only on a suitable CPU/GPU host. Set `NLI_BACKEND=transformers` to activate the MNLI model adapter. Configure Qdrant and provision documents/embeddings before setting it as the evidence source. SEP requires an intentionally trained probe artifact plus hidden states from a local open-weight LLM; it correctly returns unavailable for closed models.

Fusion and conformal components also refuse to claim model-backed results until supplied with their trained artifact/calibration files. This preserves the project’s core distinction: measured, explainable reliability instead of invented confidence.

`services/verification-engine/.env.models.example` names the provisioned BGE, DeBERTa, and Qwen deployment targets. `training/prepare_benchmarks.py` and `training/train_real_artifacts.py` provide the real-data artifact workflow; the LangGraph adapter is `app/agents/langgraph_workflow.py`.

## Evaluation artifacts required before production claims

1. Dataset splits for TruthfulQA, HaluEval, and SelfCheckGPT WikiBio.
2. Trained SEP and fusion artifacts, versioned with their feature definitions.
3. A held-out conformal calibration file including the target coverage and nonconformity quantile.
4. Layer ablation, latency, AUROC, and empirical coverage reports.

## Local infrastructure

`docker compose up --build` starts PostgreSQL, Qdrant, and the base engine. Create a database migration separately with Prisma before persisting authenticated sessions. The supplied compose engine uses its safe lexical fallback; enabling model packages and model weights is a deliberate deployment choice.
