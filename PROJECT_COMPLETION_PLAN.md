# TruthLayer Completion Plan

## Objective

Finish TruthLayer as a trustworthy LLM-verification platform with three products:

1. **TruthLayer platform** — authenticated dashboard, verification API, evidence receipts, API keys, sessions, analytics, and operational controls.
2. **TruthLayer SDK** — publishable TypeScript client, then Python client, for verified responses and streaming events.
3. **SDK showcase** — a separate consumer application that uses only the public SDK/API across general, healthcare, legal, and finance workflows.

The system must preserve the V1–V4 differentiation: it is not just RAG. It combines internal uncertainty, sampled semantic disagreement, continuous kernel entropy, external evidence/NLI, interpretable fusion, and calibrated confidence.

## Current baseline

Completed:

- npm monorepo with Next.js 16 platform and SDK showcase.
- Public verification API and `@truthlayer/sdk` contract.
- FastAPI verification-engine boundary.
- PostgreSQL/Prisma schema and API-key primitives.
- Docker Compose definitions for PostgreSQL, Qdrant, and the engine.
- Development fallback retrieval/NLI plus modules for all planned signal layers.

Not yet complete:

- PostgreSQL migrations and live persistence.
- Authentication and organization authorization.
- Evidence ingestion/indexing.
- Real model artifacts, model-serving configuration, training, and calibration.
- Agentic workflow orchestration.
- Streaming, production observability, tests, deployment, and benchmark results.

## Architecture guardrails

- The showcase imports `@truthlayer/sdk` only; it cannot import platform internals.
- The SDK/API response contract is versioned and backward compatible.
- LangGraph/LangChain may coordinate retrieval and retry workflows, but never replaces explicit entropy, NLI, fusion, or conformal calculations.
- A missing trained model must report `unavailable`, never an invented model score.
- API-key secrets are stored only as hashes; the raw secret is returned once.
- Every verification produces a reproducible receipt with model/artifact versions and evidence.

## Milestone 0 — Local operational baseline

### Work

- Start Docker Compose services for PostgreSQL, Qdrant, and the verification engine.
- Add the initial Prisma migration.
- Seed one development organization and create its first API key.
- Configure the platform with database, bootstrap, and engine environment variables.
- Exercise an SDK verification call using a real bearer key and confirm receipt persistence.

### Done when

- `docker compose up --build` starts all services.
- Prisma migration completes against local PostgreSQL.
- A valid SDK key receives a verification receipt and invalid/revoked keys receive `401`.
- A persisted session appears through the sessions API.

## Milestone 1 — Platform identity and product foundation

### Work

- Add Auth.js authentication with email/password or OAuth provider support.
- Added the credentials-based registration/sign-in foundation; organization onboarding and protected dashboard authorization remain.
- Add organization onboarding, membership roles (`owner`, `admin`, `member`), and organization switching.
- Replace the temporary bootstrap-token key routes with session/organization authorization.
- Build dashboard routes: overview, playground, sessions, API keys, analytics, settings, and docs.
- Add key creation/revocation UI, key permissions/scopes, usage metering, rate limiting, and audit events.
- Persist sessions and receipts in PostgreSQL; add filtering, pagination, and receipt-detail views.

### Done when

- An authenticated user can create an organization, create/revoke a key, and view only their organization’s sessions.
- The platform dashboard displays persisted verification history.
- API keys have scoped authorization and server-side rate-limit enforcement.

## Milestone 2 — Evidence ingestion and hybrid retrieval

### Work

- Define evidence-source and document-chunk database models.
- Build ingestion for curated documents first; add URL/PDF/file ingestion after source metadata is stable.
- Normalize, chunk, embed, and index evidence in Qdrant.
- Add BM25 sparse index and reciprocal-rank fusion with dense retrieval.
- Add cross-encoder reranking and evidence provenance: source URL, title, chunk ID, timestamp, and checksum.
- Add source allowlists and domain-specific knowledge collections for healthcare, legal, and finance demos.

### Done when

- A claim retrieves ranked, cited passages from Qdrant/BM25.
- A verification receipt records exact evidence provenance.
- Retrieval quality is measured with a small labeled evaluation set before NLI integration.

## Milestone 3 — Real NLI and claim verification

### Work

- Provision DeBERTa-v3-large-MNLI or a validated equivalent.
- Implement batched NLI inference for claim/evidence pairs.
- Normalize model labels to entailment, contradiction, and neutral probabilities.
- Define claim-level grounding score using NLI probabilities plus retrieval confidence.
- Add evidence insufficiency and contradiction handling rather than forcing binary outcomes.
- Evaluate NLI and retrieval together on TruthfulQA, HaluEval, and a domain-specific validation set.

### Done when

- Development lexical NLI is disabled in model-backed environments.
- Receipts expose NLI probabilities and cited evidence.
- A benchmark report shows grounding/contradiction detection metrics and latency.

## Milestone 4 — Uncertainty layers

### 4A: Semantic Entropy

- Add controlled multi-sample generation through a local open-weight model or configured model provider.
- Implement bidirectional NLI semantic clustering.
- Add adaptive sampling: stop early for clear answers and sample more for uncertain answers.
- Report entropy, sample count, clusters, and sampling cost in each receipt.

### 4B: Kernel Language Entropy

- Build pairwise soft-entailment kernel matrices.
- Calculate normalized von Neumann entropy using eigendecomposition.
- Store graph-ready kernel edges for the platform evidence visualization.

### 4C: Semantic Entropy Probe

- Provision local Llama/Qwen inference with hidden-state capture.
- Generate SEP training targets from sampled semantic-entropy runs.
- Train a probe, version the artifact, and measure its latency/AUROC against full SE.
- Use SEP only where hidden states are actually available; expose graceful degraded mode elsewhere.

### Done when

- Every uncertainty layer has a real artifact or explicitly reports unavailable.
- Per-layer ablations compare accuracy, latency, and cost.
- The system documents closed-model degradation honestly.

## Milestone 5 — Fusion and conformal calibration

### Work

- Define the versioned feature schema: SEP, SE, KLE, NLI, retrieval confidence, and top retrieval score.
- Train LightGBM/XGBoost or logistic-regression fusion baselines on labeled data.
- Version model artifacts, training data hashes, and feature definitions.
- Fit conformal calibration on a held-out calibration split.
- Add calibration interval/coverage metadata to receipts and dashboard visualizations.
- Generate SHAP/feature-importance reports.

### Done when

- The fused detector beats each single layer on held-out AUROC.
- Empirical conformal coverage is reported against the chosen target.
- No coverage guarantee is displayed without a matching calibration artifact.

## Milestone 6 — Agentic orchestration

### Scope

Build a bounded LangGraph workflow, not a free-form truth-deciding agent:

```text
claim extraction
  → parallel SEP / SE / KLE / retrieval
  → evidence sufficiency check
  → query reformulation only when evidence is insufficient
  → NLI verification
  → fusion + conformal calibration
  → immutable receipt
```

### Work

- Use LangGraph state to track claims, attempts, evidence, budgets, failures, and artifacts.
- Add bounded retrieval-query reformulation and source selection tools.
- Add deterministic stop conditions, maximum retries, timeouts, and cost budgets.
- Keep all final trust scoring inside explicit engine functions.
- Add trace IDs across platform, engine, model calls, and receipt data.
- Add workflow replay tests with recorded fixtures.

### Done when

- The agent cannot loop indefinitely or fabricate sources.
- Each retry and evidence decision is visible in the receipt trace.
- The agentic layer improves evidence recall without replacing deterministic scoring.

## Milestone 7 — SDK and showcase completion

### SDK

- Add package build, versioning, changelog, API reference, typed errors, retries, and streaming events.
- Add `verifyStream()` for claim-level partial receipts.
- Publish TypeScript package; create Python client after API stability.
- Add contract tests against the platform API.

### Showcase

- Add real model-response generation before verification.
- Build streaming trust meter, claim cards, evidence/citation panel, and receipt export.
- Add domain tabs with curated sources and appropriate safety disclaimers.
- Add a visible SDK-code panel and no internal platform imports.

### Done when

- An external developer can install the SDK and reproduce the showcase flow.
- The showcase runs entirely through public platform credentials and API calls.

## Milestone 8 — Evaluation, security, and production readiness

### Work

- Add unit, integration, contract, and end-to-end tests.
- Add benchmark/evaluation harnesses, ablations, calibration plots, and latency/cost reports.
- Add structured logs, metrics, tracing, error monitoring, health checks, and alerts.
- Add secret management, request validation, RBAC, quotas, CORS policy, audit logging, and dependency scanning.
- Add CI for lint, build, tests, schema validation, and SDK contract checks.
- Add staging/production deployment manifests and model/data retention policies.

### Done when

- CI blocks regressions across platform, SDK, showcase, and engine.
- Dashboard/system health reflects actual service state.
- A reproducible deployment guide and security review are complete.

## Final demonstration checklist

- Show a confidently wrong answer detected by evidence/NLI or uncertainty signals.
- Show a correct grounded answer with claim-level citations.
- Toggle individual layers and display the ablation impact.
- Show calibrated confidence with a documented coverage target.
- Demonstrate the SDK showcase calling the same public API.
- Explain graceful degradation for closed APIs and unavailable hidden states.

## Recommended execution order

1. Milestone 0
2. Milestone 1
3. Milestones 2 and 3
4. Milestones 4 and 5
5. Milestone 6
6. Milestone 7
7. Milestone 8

Do not claim research-grade hallucination detection until Milestones 2–5 have trained artifacts, held-out evaluation, and calibration evidence.
