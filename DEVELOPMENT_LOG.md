# Development Log

## 2026-08-06 — Foundation

- Created an npm-workspace monorepo.
- Added independent Next.js 16 platform and showcase applications.
- Added `@argus/sdk` as the sole integration path from showcase to platform.
- Defined the first public verification request/result contract.
- Implemented a deterministic development verifier to make the end-to-end experience usable before the ML pipeline is connected.
- Installed the workspace dependencies and verified that all three workspaces build with Next.js 16.3.0 and TypeScript.
- Exercised `POST /api/v1/verify` locally with the France/Eiffel Tower example; it returned a grounded, per-claim receipt.
- Extracted verification logic from the HTTP route into a dedicated pipeline boundary and added a development sessions endpoint. This makes it possible to replace the temporary estimator with the actual ML services without breaking the SDK contract.
- Added the standalone FastAPI verification-engine service. The platform can now delegate verification to `ARGUS_ENGINE_URL` while retaining the existing SDK and API contract.
- Confirmed the TypeScript workspaces still build after the engine integration. Python is not installed in the current environment, so the FastAPI service needs runtime validation on a Python-enabled machine or through Docker.
- Added PostgreSQL/Prisma models for organizations, users, API keys, and verification sessions. Added API-key bootstrap, listing, revocation, authentication, and authenticated receipt persistence routes. Schema validation and Prisma Client generation passed; a local PostgreSQL instance is still required to apply the first migration and exercise database-backed requests.
- Expanded the FastAPI engine into V1–V4 modules for hybrid retrieval, NLI, semantic entropy, kernel language entropy, SEP, fusion, conformal calibration, and async orchestration. Docker Compose now defines PostgreSQL, Qdrant, and the engine. Model-backed layers deliberately report unavailable until real model/artifact configuration is supplied.
- Added an end-to-end completion plan with milestones, acceptance criteria, model/artifact requirements, agentic orchestration constraints, and production readiness work.
- Added a deterministic synthetic-data/artifact generator, a synthetic fusion/SEP/conformal proof-artifact format, bounded evidence-agent implementation, and a reproducibility notebook. These assets are explicitly marked synthetic-only.
- Added Auth.js credentials authentication, password-hashed registration endpoint, and the initial migration including Auth.js-compatible user, account, session, and verification-token models.
- Added real-model environment configuration (BGE, DeBERTa MNLI, Qwen), benchmark normalization/training scripts, a real fusion/conformal artifact trainer, and a bounded LangGraph evidence workflow. Execution awaits a Python/GPU-capable runtime and benchmark downloads.
- Added a Next.js sign-in/registration UI backed by the Auth.js credentials flow. The platform, showcase, and SDK builds pass after this integration.
- Added a detailed V1–V4 vision-alignment and remaining-work document with implementation ordering and acceptance criteria.

## Decision record

- The showcase must not import platform code. This preserves a real SDK integration boundary.
- LangChain/LangGraph will support retrieval and stateful orchestration where valuable, but will not hide the scoring, entropy, fusion, or calibration algorithms.
- The current verifier is explicitly a scaffold. It is not marketed as the completed research-grade detector described in the project plans.
