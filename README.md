# Argus

Argus is verification infrastructure for LLM output. It scores individual claims using a layered system: model uncertainty signals, semantic consistency, retrieval-grounded entailment, interpretable fusion, and calibrated confidence.

This repository contains three separately deployable products:

| Workspace | Purpose |
| --- | --- |
| `apps/platform` | Argus dashboard and public verification API (`@argus/platform`) |
| `packages/sdk` | TypeScript SDK for the public API (`@argus/sdk`) |
| `apps/showcase` | Consumer demo that uses only the SDK (`@argus/showcase`) |

## Quick start

### 1. Node.js & Next.js Workspaces
```powershell
npm install
npm run build
npm run dev:platform   # Platform UI & API at http://localhost:3000
npm run dev:showcase   # SDK Showcase at http://localhost:3001
```

### 2. Python Verification Engine Environment
```powershell
conda create -n argus_env python=3.12 -y
C:\Users\devan\miniconda3\envs\argus_env\Scripts\pip.exe install -r services/verification-engine/requirements.txt pytest
```

### 3. Services, Migration & Artifact Training
```powershell
docker compose up -d
npm run db:generate
npm run db:validate
C:\Users\devan\miniconda3\envs\argus_env\python.exe services/verification-engine/training/train_real_artifacts.py
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for system boundaries and [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md) for the implementation record.
Database and API-key setup is documented in [DATABASE.md](DATABASE.md).
The complete V1–V4 backend implementation map and model deployment boundaries are in [BACKEND.md](BACKEND.md).
The dependency-ordered implementation plan and V1–V4 release gates are in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
Synthetic data and trained proof artifacts are documented in [SYNTHETIC_ARTIFACTS.md](SYNTHETIC_ARTIFACTS.md).
