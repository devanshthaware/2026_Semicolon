# TruthLayer Codebase Index

## Repository purpose

TruthLayer is an LLM-output verification platform with a public API, SDK, developer dashboard, separate showcase, verification engine, model/training pipeline, and infrastructure configuration.

## Entry points

| Area | Location | Purpose |
| --- | --- | --- |
| Root workspace | `package.json` | npm workspaces and shared build/database/artifact scripts. |
| Primary dashboard | `frontend/platform` | Next.js 16 developer platform with dashboard, auth middleware, API routes, UI components, and Prisma access. |
| SDK showcase | `frontend/showcase` | Separate Next.js consumer demo that should integrate via the SDK/API. |
| SDK | `packages/sdk/src/index.ts` | Public TypeScript API contract and client. |
| Verification engine | `services/verification-engine/app/main.py` | FastAPI service for verification orchestration. |
| Database | `prisma/schema.prisma` | PostgreSQL/Prisma data model and migrations. |
| Infrastructure | `docker-compose.yml` | PostgreSQL, Qdrant, and verification-engine services. |

## Frontend platform

### Application routes

| Route area | Files | Responsibility |
| --- | --- | --- |
| Root / login | `frontend/platform/app/page.tsx`, `app/login/**` | Landing and credentials-auth entry flow. |
| Dashboard shell | `app/dashboard/page.tsx`, `dashboard-client.tsx`, `components/layout/**` | Dashboard layout, sidebar, navigation, theme, and shared product chrome. |
| Playground | `app/dashboard/playground/page.tsx` | Interactive verification experience. |
| Sessions | `app/dashboard/sessions/**` | Verification-history and receipt UI. |
| API keys | `app/dashboard/api-keys/**` | Key lifecycle interface. |
| Analytics | `app/dashboard/analytics/page.tsx` | Usage/trust/latency visualizations. |
| Evidence | `app/dashboard/evidence/**` | Evidence ingestion UI. |
| Organization onboarding | `app/dashboard/onboarding/**` | Organization setup flow. |
| Admin | `app/dashboard/users`, `api-management`, `system-health` | Administrative views. |
| Platform API | `app/api/v1/**` | Verify, sessions, keys, organizations, and ingest endpoints. |

### Platform support modules

| File | Responsibility |
| --- | --- |
| `frontend/platform/auth.ts` | Auth.js credentials configuration. |
| `frontend/platform/middleware.ts` | Route protection and auth boundary. |
| `frontend/platform/lib/db.ts` | Prisma client singleton. |
| `frontend/platform/lib/api-keys.ts` | API-key generation/hashing helpers. |
| `frontend/platform/components/ui/**` | Shared shadcn-style UI primitives. |

## Verification engine

| Module | Responsibility |
| --- | --- |
| `app/main.py` | FastAPI health and verification endpoints. |
| `app/pipeline.py` | Per-claim async verification orchestration and receipt assembly. |
| `app/claims.py` | Claim extraction boundary. |
| `app/retrieval.py` | Hybrid-retrieval interface; local lexical fallback until Qdrant/BM25 is live. |
| `app/nli.py` | NLI adapter; lexical fallback or transformer-backed DeBERTa path. |
| `app/signals/semantic_entropy.py` | Semantic clustering/entropy computation. |
| `app/signals/kernel_entropy.py` | Kernel Language Entropy calculation. |
| `app/signals/sep.py` | Semantic Entropy Probe artifact interface. |
| `app/fusion.py` | Fusion-score model/artifact loader. |
| `app/conformal.py` | Conformal calibration artifact loader and intervals. |
| `app/agents/evidence_agent.py` | Bounded evidence-retrieval agent. |
| `app/agents/langgraph_workflow.py` | Bounded LangGraph wrapper around evidence retrieval. |
| `app/ingestion.py` | Evidence ingestion boundary. |
| `training/**` | Benchmark preparation and real-artifact training jobs. |
| `preload_models.py` | Model-cache/preload utility. |

## Data, models, and artifacts

| Location | Contents | Tracking policy |
| --- | --- | --- |
| `data/synthetic/**` | Deterministic proof datasets. | Committed. |
| `data/synthetic_examples/**` | CSV examples and ML-data explanations. | Committed. |
| `artifacts/fusion/**` | Synthetic fusion proof artifact. | Committed. |
| `artifacts/conformal/**` | Synthetic conformal proof artifact. | Committed. |
| `artifacts/sep/**` | Synthetic SEP proof artifact. | Committed. |
| `artifacts/real/**` | Real trained model artifacts. | Ignored by `.gitignore`; version externally. |
| `data/benchmarks/**` | Downloaded benchmark data. | Ignored; reproducibly acquire via training scripts. |

## Database and infrastructure

| File | Responsibility |
| --- | --- |
| `prisma/schema.prisma` | Users, Auth.js records, organizations, memberships, API keys, sessions, evidence-related entities. |
| `prisma/migrations/20260806170000_init/migration.sql` | Initial platform schema. |
| `prisma/migrations/20260806175727_evidence_ingestion/migration.sql` | Evidence-ingestion schema extension. |
| `docker-compose.yml` | Local PostgreSQL, Qdrant, and engine topology. |
| `DATABASE.md` | Database/API-key operations. |

## Architecture and planning documents

| File | Scope |
| --- | --- |
| `README.md` | Repository overview and local startup. |
| `ARCHITECTURE.md` | Product boundaries and API architecture. |
| `BACKEND.md` | V1–V4 verification-engine architecture. |
| `TruthLayer_Model_Swap_Architecture.md` | Hardware/model-profile abstraction and swap rules. |
| `VISION_ALIGNMENT_AND_REMAINING_WORK.md` | Alignment with the V1–V4 vision and remaining implementation. |
| `PROJECT_COMPLETION_PLAN.md` | Ordered completion milestones and acceptance criteria. |
| `SYNTHETIC_ARTIFACTS.md` | Synthetic proof-artifact policy. |
| `UI_Plan.md` | Dashboard and product UI direction. |
| `DEVELOPMENT_LOG.md` | Chronological implementation record. |

## Repository cleanup items

- `apps/platform` and `apps/showcase` are earlier workspace implementations; `frontend/platform` is the richer current dashboard. Choose one canonical frontend structure before further feature work.
- `frontend/showcase/showcase/**` duplicates `frontend/showcase/**`. Consolidate this nested duplicate after confirming which package is the active showcase.
- Root scripts currently target workspace package names. Confirm each active frontend package declares the expected `@truthlayer/platform` / `@truthlayer/showcase` names.
- Keep generated local runtimes (`.conda/`, Python virtual environments, Node modules, model caches, downloaded benchmarks) untracked as enforced by `.gitignore`.

## Canonical implementation path

For new work, prefer `frontend/platform` for the platform UI, `packages/sdk` for public API types, `services/verification-engine` for verification logic, and `prisma` for persistence. Treat the duplicate/earlier frontend folders as migration candidates until consolidation is complete.
