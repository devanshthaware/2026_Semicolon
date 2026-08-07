# 02_SYSTEM_OVERVIEW.md

# TruthLayer System Overview

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter provides a high-level overview of the TruthLayer platform,
describing its major subsystems, architectural layers, responsibilities,
and the end-to-end verification lifecycle.

------------------------------------------------------------------------

# Platform Overview

TruthLayer is a verification platform that sits between an application
and a Large Language Model (LLM). It evaluates generated responses using
multiple independent verification techniques before returning a
calibrated trust score and verification receipt.

``` text
User
  │
  ▼
Frontend
  │
  ▼
FastAPI Gateway
  │
  ▼
LangGraph Verification Workflow
  │
  ▼
LLM + Verification Services
  │
  ▼
Fusion Trust Model
  │
  ▼
Verification Receipt
  │
  ▼
Verified Response
```

------------------------------------------------------------------------

# System Objectives

-   Detect hallucinations
-   Verify factual claims
-   Explain verification decisions
-   Produce calibrated trust scores
-   Support real-time streaming
-   Provide reusable SDKs and APIs

------------------------------------------------------------------------

# Architectural Layers

## 1. Presentation Layer

Components: - Startup Website - Developer Console - Documentation - SDK
Showcase

Responsibilities: - User interaction - Visualization - API exploration

------------------------------------------------------------------------

## 2. API Layer

Technology: - FastAPI

Responsibilities: - Authentication - API keys - REST endpoints -
WebSocket/SSE streaming - Request validation

------------------------------------------------------------------------

## 3. Workflow Layer

Technology: - LangGraph

Responsibilities: - State management - Workflow orchestration - Parallel
execution - Retry handling

Shared object:

``` python
VerificationState:
    prompt
    response
    claims
    evidence
    verification_signals
    trust_score
    receipt
```

------------------------------------------------------------------------

## 4. Agent Layer

Primary agents:

-   Orchestrator
-   Response
-   Claim Extraction
-   Retrieval
-   NLI
-   Semantic Analysis
-   Symbolic Verification
-   Temporal Validation
-   Cross-Model Agreement
-   Fusion Trust
-   Calibration
-   Receipt

Each agent performs a single responsibility and communicates through the
shared workflow state.

------------------------------------------------------------------------

## 5. AI Layer

### Custom Models

-   Semantic Entropy Probe
-   Fusion Trust Model
-   Claim Type Classifier
-   Claim Extraction Model
-   Claim Dependency Model
-   Trust Calibration

### Pretrained Components

-   Qwen / Llama / Gemma / Mistral
-   DeBERTa-v3-MNLI
-   BGE / E5 Embeddings
-   BM25
-   BGE Reranker
-   Z3 Solver
-   Python Arithmetic Engine

------------------------------------------------------------------------

## 6. Knowledge Layer

Responsibilities:

-   Hybrid retrieval
-   Dense embeddings
-   Sparse search
-   Evidence ranking

Components:

-   BM25
-   Qdrant / FAISS
-   BGE Embeddings
-   BGE Reranker

------------------------------------------------------------------------

## 7. Infrastructure Layer

Components:

-   PostgreSQL
-   Redis
-   Docker
-   Kubernetes
-   LangSmith

Responsibilities:

-   Persistence
-   Caching
-   Deployment
-   Observability

------------------------------------------------------------------------

# End-to-End Request Lifecycle

1.  User submits a prompt.
2.  FastAPI authenticates the request.
3.  LangGraph creates a verification session.
4.  The LLM generates a response.
5.  Claims are extracted and classified.
6.  Verification agents execute in parallel.
7.  Signals are merged by the Fusion Trust Model.
8.  Trust Calibration adjusts the final score.
9.  A verification receipt is generated.
10. The verified response is streamed back to the client.

------------------------------------------------------------------------

# Data Flow

``` text
Prompt
   │
   ▼
LLM
   │
   ▼
Claims
   │
   ▼
Evidence + Verification Signals
   │
   ▼
Fusion Trust
   │
   ▼
Calibration
   │
   ▼
Receipt
```

------------------------------------------------------------------------

# Non-Functional Requirements

-   Low latency
-   High availability
-   Horizontal scalability
-   Explainability
-   Modular architecture
-   Model independence
-   Auditability
-   Extensibility

------------------------------------------------------------------------

# Design Principles

1.  Separate generation from verification.
2.  Prefer evidence over confidence.
3.  Keep agents stateless.
4.  Isolate model implementations.
5.  Make every verification step observable.
6.  Ensure all outputs are explainable.
7.  Allow independent replacement of models and services.

------------------------------------------------------------------------

# Related Documents

-   01_EXECUTIVE_SUMMARY.md
-   AI_MODELS_SPECIFICATION.md
-   AGENT_WORKFLOW_SPECIFICATION.md
-   PRETRAINED_COMPONENTS_SPECIFICATION.md
-   BACKEND_ECOSYSTEM_SPECIFICATION.md
