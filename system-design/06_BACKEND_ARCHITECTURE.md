# 06_BACKEND_ARCHITECTURE.md

# Argus System Design

## Chapter 6 -- Backend Architecture

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the architecture of the Python backend. It explains
how FastAPI, LangGraph, LangChain, LangSmith, verification agents, AI
models, storage systems, and supporting services work together to
execute the Argus verification pipeline.

------------------------------------------------------------------------

# Backend Goals

-   Separate transport from business logic
-   Orchestrate workflows with LangGraph
-   Keep agents stateless
-   Isolate model inference
-   Support streaming responses
-   Enable horizontal scalability
-   Provide full observability

------------------------------------------------------------------------

# Backend Overview

``` text
                 Next.js Frontend
                        │
               HTTPS / WS / SSE
                        │
                        ▼
              FastAPI API Gateway
                        │
                        ▼
             LangGraph Orchestrator
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
 Session Service   Verification      Event Bus
                    Agents            (Redis)
        │               │
        ▼               ▼
 PostgreSQL     Retrieval / Models
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
   LLM Service    Model Service   Retrieval Service
                        │
                        ▼
               Verification Receipt
```

------------------------------------------------------------------------

# Backend Layers

## Transport Layer

Technology: - FastAPI

Responsibilities: - REST APIs - WebSocket - Server-Sent Events -
Authentication - API Keys - Rate Limiting - Request Validation

FastAPI does not execute verification logic.

------------------------------------------------------------------------

## Workflow Layer

Technology: - LangGraph

Responsibilities: - Graph execution - State management - Parallel
branches - Retry policies - Node routing - Checkpointing

Shared state object:

``` python
class VerificationState:
    prompt: str
    response: str
    claims: list
    evidence: list
    verification_signals: dict
    trust_score: float
    receipt: dict
```

------------------------------------------------------------------------

## Agent Layer

Implemented as independent services or modules.

Agents:

-   Orchestrator
-   Response
-   Claim Extraction
-   Claim Type
-   Retrieval
-   NLI
-   Semantic Analysis
-   Symbolic Verification
-   Temporal Validation
-   Cross-Model Agreement
-   Fusion Trust
-   Calibration
-   Receipt

Each agent: - Reads VerificationState - Performs one task - Updates
VerificationState - Returns control to LangGraph

------------------------------------------------------------------------

## Model Layer

### Custom Models

-   Semantic Entropy Probe (PyTorch)
-   Fusion Trust Model (LightGBM)
-   Claim Type Classifier
-   Claim Extraction Model
-   Claim Dependency Model
-   Trust Calibration

### Pretrained Components

-   Qwen / Llama / Gemma / Mistral
-   DeBERTa-v3-MNLI
-   BGE / E5
-   BM25
-   BGE Reranker
-   Z3 Solver
-   Python Arithmetic Engine

Model Service responsibilities:

-   Load models
-   Version models
-   GPU allocation
-   Inference
-   Health checks

------------------------------------------------------------------------

## Retrieval Layer

Pipeline:

``` text
Claim
  │
  ▼
BM25
  │
Dense Retrieval (BGE/E5)
  │
Hybrid Merge
  │
BGE Reranker
  │
Evidence
  │
DeBERTa NLI
```

Outputs evidence and entailment signals.

------------------------------------------------------------------------

## Storage Layer

### PostgreSQL

Stores: - Users - Sessions - Receipts - API Keys - Analytics - Audit
Logs

### Redis

Stores: - Cache - Session state - Workflow events - Rate limits

### Qdrant

Stores: - Embeddings - Metadata - Document chunks

------------------------------------------------------------------------

## Observability Layer

Technology: - LangSmith

Captures: - Prompt traces - Agent execution - Workflow graph - Errors -
Latency - Token usage

------------------------------------------------------------------------

# Backend Package Structure

``` text
backend/
├── api/
├── core/
├── graph/
├── agents/
├── services/
│   ├── llm/
│   ├── retrieval/
│   ├── verification/
│   ├── analytics/
│   └── receipt/
├── models/
├── storage/
├── schemas/
├── telemetry/
├── workers/
├── tests/
└── main.py
```

------------------------------------------------------------------------

# End-to-End Backend Flow

1.  Request reaches FastAPI.
2.  Authentication and validation complete.
3.  LangGraph initializes VerificationState.
4.  Response Agent calls the selected LLM.
5.  Claims are extracted and classified.
6.  Verification agents execute in parallel.
7.  Model Service computes SEP and Fusion scores.
8.  Calibration adjusts confidence.
9.  Receipt Agent creates verification artifact.
10. FastAPI streams results back to the client.

------------------------------------------------------------------------

# Scalability Strategy

-   Stateless API servers
-   Horizontally scalable agent workers
-   Dedicated model servers
-   Independent retrieval service
-   Shared Redis cache
-   External PostgreSQL
-   Distributed vector database

------------------------------------------------------------------------

# Design Principles

1.  Transport and orchestration are separated.
2.  Business logic is agent-driven.
3.  Every service has one responsibility.
4.  Model inference is isolated.
5.  Storage concerns are independent.
6.  Observability is built into every workflow.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 05 described internal components.
-   **Chapter 06 defines the backend architecture.**
-   Chapter 07 describes the frontend architecture and how it interacts
    with this backend.
