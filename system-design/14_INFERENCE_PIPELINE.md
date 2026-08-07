# 14_INFERENCE_PIPELINE.md

# Argus System Design

## Chapter 14 -- Inference Pipeline

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines how Argus executes real-time inference after
models have been trained. It describes request processing, model
loading, verification execution, signal fusion, streaming, and response
delivery.

------------------------------------------------------------------------

# Objectives

-   Low-latency verification
-   Streaming-first execution
-   Deterministic orchestration
-   Parallel verification
-   Scalable model serving
-   Observable execution

------------------------------------------------------------------------

# High-Level Inference Flow

``` text
User Prompt
    │
    ▼
FastAPI Gateway
    │
    ▼
LangGraph Orchestrator
    │
    ▼
Response Agent (LLM)
    │
    ▼
Claim Extraction
    │
    ▼
Claim Type Classification
    │
 ┌──┬──────────┬──────────┬──────────┬──────────┐
 ▼  ▼          ▼          ▼          ▼
Retrieval Semantic Symbolic Temporal Agreement
 │  │          │          │          │
 ▼  ▼          ▼          ▼          ▼
NLI Signals  Signals   Signals   Signals
 └──────────────┬─────────────────────────┘
                ▼
        Fusion Trust Model
                ▼
      Trust Calibration
                ▼
      Receipt Generation
                ▼
       Stream to Frontend
```

------------------------------------------------------------------------

# Request Lifecycle

1.  Receive authenticated request.
2.  Create verification session.
3.  Initialize `VerificationState`.
4.  Generate LLM response.
5.  Extract and classify claims.
6.  Execute verification branches in parallel.
7.  Aggregate verification signals.
8.  Compute trust score.
9.  Calibrate confidence.
10. Generate receipt.
11. Stream final response.

------------------------------------------------------------------------

# Model Loading Strategy

The Model Service manages:

-   Lazy loading
-   Warm startup
-   Version selection
-   Health checks
-   CPU/GPU routing

Frequently used models remain resident in memory.

------------------------------------------------------------------------

# Inference Components

## LLM Service

Produces:

-   Response
-   Hidden states
-   Logits
-   Token stream

------------------------------------------------------------------------

## Retrieval Service

Pipeline:

-   BM25
-   Dense retrieval (BGE/E5)
-   Hybrid merge
-   BGE reranker
-   Evidence formatting

------------------------------------------------------------------------

## Verification Services

-   DeBERTa-v3-MNLI
-   Semantic Entropy Probe
-   Python Arithmetic Engine
-   Z3 Solver
-   Temporal validator
-   Cross-model agreement

------------------------------------------------------------------------

## Fusion Service

Consumes all verification signals.

Outputs:

-   Trust score
-   Risk level
-   Verification decision

------------------------------------------------------------------------

## Calibration Service

Methods:

-   Isotonic Regression
-   Conformal Prediction

Outputs:

-   Calibrated score
-   Confidence interval

------------------------------------------------------------------------

# VerificationState During Inference

``` python
VerificationState(
    prompt,
    response,
    claims,
    evidence,
    verification_signals,
    trust_score,
    receipt
)
```

------------------------------------------------------------------------

# Streaming Pipeline

``` text
LLM Tokens
     │
     ▼
Frontend Stream
     │
     ▼
Claim Extraction
     │
     ▼
Live Verification Updates
     │
     ▼
Trust Score Updates
     │
     ▼
Receipt Available
```

Streaming channels:

-   WebSocket
-   Server-Sent Events (SSE)

------------------------------------------------------------------------

# Caching Strategy

Redis caches:

-   Session state
-   Recent retrieval results
-   Embeddings (optional)
-   API responses
-   Workflow checkpoints

------------------------------------------------------------------------

# Performance Optimizations

-   Parallel verification
-   Stateless agents
-   Cached retrieval
-   Warm model loading
-   Batched inference where appropriate
-   Independent scaling of model servers

------------------------------------------------------------------------

# Failure Handling

  Failure                  Action
  ------------------------ --------------------------------------
  LLM timeout              Retry / fallback model
  Retrieval failure        Continue with lower confidence
  Optional agent failure   Record warning
  Critical failure         Abort workflow with structured error

------------------------------------------------------------------------

# Observability

Every inference request records:

-   Session ID
-   Graph trace
-   Node timings
-   Model versions
-   Token usage
-   Latency
-   Errors
-   Receipt ID

Tracked using LangSmith.

------------------------------------------------------------------------

# Deployment Flow

``` text
Client
  │
  ▼
API Gateway
  │
  ▼
LangGraph
  │
  ▼
Inference Services
  │
  ▼
Fusion
  │
  ▼
Calibration
  │
  ▼
Receipt
  │
  ▼
Client
```

------------------------------------------------------------------------

# Design Principles

1.  Inference is stateless.
2.  Workflow execution is deterministic.
3.  Parallel verification minimizes latency.
4.  Models are isolated behind the Model Service.
5.  Every inference produces an auditable receipt.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 13 defined model training.
-   **Chapter 14 defines the production inference pipeline.**
-   Chapter 15 describes the retrieval architecture in detail.
