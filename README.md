# TruthLayer

TruthLayer is verification infrastructure for LLM output. It scores individual claims using a layered system: model uncertainty signals, semantic consistency, retrieval-grounded entailment, interpretable fusion, and calibrated confidence.

This repository contains three separately deployable products:

| Workspace | Purpose |
| --- | --- |
| `frontend/platform` | TruthLayer dashboard and public verification API |
| `packages/sdk` | TypeScript SDK for the public API |
| `frontend/showcase` | Consumer demo that uses only the SDK |

## Quick start

```powershell
npm.cmd install
npm.cmd run dev:platform
# in another terminal
npm.cmd run dev:showcase
```

The platform runs at `http://localhost:3000`; the showcase runs at `http://localhost:3001`.

To delegate the platform API to the FastAPI verification engine, run the `verification-engine` service described in [its README](services/verification-engine/README.md) and copy `frontend/platform/.env.example` to `frontend/platform/.env.local`.

See [ARCHITECTURE.md](ARCHITECTURE.md) for system boundaries and [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md) for the implementation record.

Database and API-key setup is documented in [DATABASE.md](DATABASE.md).

The complete V1–V4 backend implementation map and model deployment boundaries are in [BACKEND.md](BACKEND.md).

The ordered end-to-end delivery roadmap is [PROJECT_COMPLETION_PLAN.md](PROJECT_COMPLETION_PLAN.md).

Current implementation gaps, vision alignment, and the exact remaining integration sequence are in [VISION_ALIGNMENT_AND_REMAINING_WORK.md](VISION_ALIGNMENT_AND_REMAINING_WORK.md).

Synthetic data, trained-on-synthetic proof artifacts, and the reproducibility notebook are documented in [SYNTHETIC_ARTIFACTS.md](SYNTHETIC_ARTIFACTS.md).
