# Argus Architecture

## Product boundaries

Argus deliberately separates the verification platform from the developer-facing demo:

```text
SDK showcase app  ──uses──>  @argus/sdk  ──calls──>  Argus public API
                                                              │
                                                              ▼
                                                   Verification pipeline
```

The showcase never imports platform internals. This proves that an outside developer can adopt the product through the published SDK and API contract alone.

## Platform data and access

PostgreSQL/Prisma persist organizations, memberships, hashed API keys, and authenticated verification receipts. The public verification endpoint accepts `Authorization: Bearer tl_live_…`; if supplied, the key must be active and its organization owns the persisted session. A bootstrap token protects temporary key-management routes until dashboard authentication is implemented.

## Verification approach

The production target retains the research direction in the V1–V4 plans:

1. Semantic Entropy Probes (white-box hidden-state signal when available)
2. Semantic Entropy across multiple sampled outputs
3. Kernel Language Entropy for continuous semantic disagreement
4. Retrieval-grounded entailment for confident-but-wrong claims
5. Interpretable fusion plus conformal calibration

The engine implementation is documented in [BACKEND.md](BACKEND.md), including which layers are operational in development and which require trained models or calibration artifacts.

The initial API implements a deterministic, explainable development estimator. It establishes the API and evidence contract before GPU inference, hybrid retrieval, and trained calibration models replace individual scores.

## Initial API contract

`POST /api/v1/verify`

```json
{
  "input": "What is the capital of France?",
  "response": "Paris is the capital of France.",
  "mode": "standard"
}
```

It returns an overall trust score, per-claim verdicts, layer scores, evidence placeholders, and a verification receipt. The contract is represented in `@argus/sdk` and used by the showcase.

`GET /api/v1/sessions` returns the most recent development-session summaries. Sessions are currently process-memory only; PostgreSQL-backed storage is the next persistence milestone.

## Technology choices

- Next.js 16 + TypeScript for both web apps
- TypeScript SDK with fetch-based transport
- Tailwind-ready CSS tokens (kept dependency-free for the first scaffold)
- FastAPI verification-engine service with a local retrieval/NLI development adapter; planned upgrades are vLLM/Transformers, DeBERTa MNLI, Qdrant, BM25, LightGBM, and MAPIE
- Planned orchestration: LangChain/LangGraph only around retrieval and workflow state; verification math stays explicit and testable

## Roadmap

1. Establish platform API, dashboard, SDK, and consumer showcase
2. Add authentication, persisted sessions, API keys, and audit receipts
3. Replace the development retrieval/NLI adapter with Qdrant, reranking, and DeBERTa MNLI
4. Add semantic entropy, KLE, fusion training, and conformal calibration
5. Stream per-claim results and add evaluation/observability
