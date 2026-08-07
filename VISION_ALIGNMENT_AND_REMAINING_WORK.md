# Argus Vision Alignment and Remaining Work

## Purpose

This document compares the current codebase with the V1–V4 project plans and records the exact work required to finish Argus without diluting its original ambition.

## Vision from the project plans

Argus is intended to be verification infrastructure for LLM output, not a basic RAG chatbot or a generic fact-checker. Its differentiators are:

1. **Per-claim trust**, not one opaque response-level score.
2. **Four complementary signals**: semantic entropy probe (SEP), semantic entropy (SE), kernel language entropy (KLE), and retrieval-grounded entailment.
3. **Confident-wrong detection** through external evidence and NLI, not only model self-consistency.
4. **Fusion**, rather than trusting a single detector.
5. **Conformal calibration** so a displayed confidence level is measured and supportable.
6. **Evidence receipts and visual explanations** that make decisions auditable.
7. **SDK-first delivery**: outside applications must use Argus through the public API and SDK.
8. **Graceful degradation** when hidden states or local models are unavailable.
9. **Agentic orchestration with limits**: agents improve retrieval/evidence collection but cannot invent truth or replace deterministic scoring.

## Alignment summary

| Area | Alignment | Current state |
| --- | --- | --- |
| Three-product structure | Aligned | Platform, SDK, and separate showcase workspaces exist. |
| SDK-first showcase | Aligned | Showcase imports `@argus/sdk`, not platform internals. |
| API/receipt contract | Partially aligned | Public verification response exists; streaming/versioned receipt expansion remains. |
| Retrieval-grounded NLI | Partially aligned | Adapter and lexical fallback exist; Qdrant/BM25/DeBERTa are not running. |
| Semantic entropy | Partially aligned | Formula/module exists; no real multi-sample model integration or NLI clustering yet. |
| Kernel language entropy | Partially aligned | Formula/module exists; no production soft-entailment kernel input yet. |
| SEP | Partially aligned | Probe artifact interface exists; no Qwen/Llama hidden-state extraction or real SEP training. |
| Fusion | Partially aligned | Synthetic proof artifact works; benchmark-trained production model is missing. |
| Conformal prediction | Partially aligned | Synthetic proof artifact works; benchmark-calibrated guarantee is missing. |
| Agentic orchestration | Partially aligned | Bounded evidence agent and LangGraph graph exist; it is not yet wired into production traces/evaluation. |
| Premium product UI | Partially aligned | Playground and showcase exist; full dashboard pages and evidence visualization remain. |
| Production security/operations | Partially aligned | Schema, API-key hashing, and Auth.js foundation exist; RBAC, runtime persistence, observability, and deployment remain. |

## Important truthfulness constraint

The current synthetic fusion, SEP, and conformal artifacts are valid engineering proof artifacts only. They prove that artifact loading, inference contracts, and calibration metadata work. They **must not** be described as real hallucination-detection accuracy, benchmark results, or production confidence guarantees.

The project matches the architecture and intent of your vision. It does **not yet** match the claimed research/production capability until real data, models, training, evaluation, and calibration are complete.

## Remaining implementation, step by step

### Step 1 — Make the local runtime operational

1. Resolve the local Python 3.12 runtime issue and make Docker’s CLI reachable from the execution environment.
2. Start PostgreSQL, Qdrant, and the FastAPI engine through Docker Compose.
3. Copy environment templates, set `DATABASE_URL`, `AUTH_SECRET`, engine URL, and a development bootstrap token.
4. Apply `prisma/migrations/20260806170000_init/migration.sql` through Prisma.
5. Create a test organization and API key.
6. Test: SDK request → platform API → engine → persisted PostgreSQL receipt.

**Acceptance:** a valid API key creates a persisted receipt; an invalid/revoked key receives `401`.

### Step 2 — Finish product authorization and dashboard workflows

1. Require Auth.js sessions on dashboard routes.
2. Add onboarding to create an organization after registration.
3. Add organization role checks for owner/admin/member.
4. Replace bootstrap-token API-key administration with authenticated organization routes.
5. Build pages for Sessions, API Keys, Analytics, Settings, Docs, and System Health.
6. Add session pagination/filtering, receipt detail, key creation/revocation, and usage display.

**Acceptance:** users can only see and manage their own organization’s records.

### Step 3 — Build evidence ingestion and hybrid retrieval

1. Add Prisma models for evidence sources, documents, chunks, and ingestion jobs.
2. Implement file/URL ingestion with source URL, title, timestamp, checksum, and collection metadata.
3. Chunk and embed evidence with BGE/E5.
4. Index dense vectors in Qdrant and sparse text in BM25.
5. Fuse ranks using reciprocal-rank fusion; add cross-encoder reranking.
6. Add domain collections for healthcare, legal, finance, and general sources.

**Acceptance:** each receipt has cited, traceable evidence passages from a real corpus.

### Step 4 — Provision and integrate real models

Recommended laptop-safe configuration for RTX 4050-class 6 GB VRAM:

- Embeddings: `BAAI/bge-large-en-v1.5` or `intfloat/e5-large-v2`.
- NLI: a DeBERTa MNLI model, preferably CPU/batched if VRAM is constrained.
- Generation/hidden states: Qwen 2.5 3B or quantized 7B; use 4-bit quantization for local inference.

Implementation:

1. Install `requirements-ml.txt` in a supported Python 3.12 environment.
2. Download/cache model weights through Hugging Face.
3. Configure model locations/environment values in `.env.models`.
4. Replace lexical NLI fallback with model-backed DeBERTa inference.
5. Add BGE/E5 embeddings to the Qdrant indexer/retriever.
6. Add controlled Qwen sampling and hidden-state capture.

**Acceptance:** receipts identify active model names/versions; fallback modes are only used when explicitly configured.

### Step 5 — Train the research layers on real data

1. Download and normalize TruthfulQA, HaluEval, and SelfCheckGPT WikiBio.
2. Create reproducible train/calibration/test splits with versioned dataset hashes.
3. Run model generations and produce per-claim SE/KLE/retrieval/NLI features.
4. Train SEP from local-model hidden states with semantic-entropy targets.
5. Train fusion with LightGBM/XGBoost and store feature schema/version alongside the artifact.
6. Fit conformal calibration only on a held-out calibration split.
7. Store artifacts outside source control or through model/artifact versioning.

**Acceptance:** `artifacts/real/` contains trained, versioned artifacts with dataset IDs, metrics, model IDs, and feature definitions.

### Step 6 — Evaluate and prove the claims

1. Measure AUROC/precision/recall per layer and for fused output.
2. Create ablation results: SEP only, SE only, KLE only, retrieval/NLI only, fused.
3. Measure latency, sample counts, GPU memory, and cost per claim.
4. Calculate empirical conformal coverage against the target level.
5. Generate plots/tables for the dashboard, notebook, and pitch deck.
6. Document limitations, distribution shift, and closed-model degraded mode.

**Acceptance:** all headline claims are backed by reproducible held-out metrics, never synthetic-only results.

### Step 7 — Complete agentic orchestration safely

1. Use LangGraph state for claim, query, attempt, evidence, latency budget, and trace ID.
2. Permit query reformulation only when retrieval confidence is insufficient.
3. Set maximum attempts, timeouts, tool allowlists, and cost budgets.
4. Persist agent traces in receipts.
5. Ensure only fusion/conformal modules create final trust decisions.
6. Compare agentic retrieval recall against a no-agent baseline.

**Acceptance:** agent traces are replayable; the agent cannot fabricate sources or loop without bounds.

### Step 8 — Complete SDK and showcase

1. Add SDK build/publish configuration, semantic versioning, changelog, and API reference.
2. Add streaming `verifyStream()` events and typed failure/retry behavior.
3. Add SDK contract tests against a live platform instance.
4. Update showcase to generate model output, stream trust events, and render evidence/citations.
5. Add semantic-kernel evidence graph and downloadable JSON/PDF receipt.
6. Complete healthcare/legal/finance demos using carefully curated source collections and safety disclaimers.

**Acceptance:** the showcase proves an external developer can integrate Argus entirely through the SDK.

### Step 9 — Production hardening

1. Add unit, integration, contract, and end-to-end tests.
2. Add Redis for rate limiting, caching, and background ingestion jobs.
3. Add structured logs, traces, metrics, health checks, Sentry, and alerts.
4. Add CI for typecheck, lint, build, migration validation, tests, and security scanning.
5. Configure secrets, CORS, CSP, RBAC, audit logs, retention policy, backups, and deployment environments.
6. Publish operational runbooks and incident procedures.

**Acceptance:** staging deployment is reproducible, monitored, and passes security/reliability checks.

## Future extensions after core completion

- Python SDK and additional language SDKs.
- Hosted evidence-source connectors and enterprise collections.
- Batch evaluation API and benchmark reporting console.
- Custom domain calibration per organization.
- Human-review queues for high-risk claims.
- Multi-model comparison and policy-driven routing.
- Fine-tuned claim extraction and citation-quality models.

## Definition of complete

Argus is complete only when an authenticated external developer can install the SDK, call a deployed public API, receive streamed claim-level receipts with real cited evidence and calibrated scores, inspect those sessions in the dashboard, and reproduce benchmark-backed evaluation results.
