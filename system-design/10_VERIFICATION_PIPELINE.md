# 10_VERIFICATION_PIPELINE.md

# TruthLayer System Design

## Chapter 10 -- Verification Pipeline

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the complete end-to-end verification pipeline used
by TruthLayer. It explains how a user request flows through the backend,
how verification signals are generated, merged, calibrated, and returned
as a verified response.

------------------------------------------------------------------------

# Pipeline Overview

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
Response Generation (LLM)
    │
    ▼
Claim Extraction
    │
    ▼
Claim Type Classification
    │
 ┌──┬──────────┬──────────┬──────────┬──────────┐
 ▼  ▼          ▼          ▼          ▼
Retrieval  Semantic  Symbolic  Temporal Agreement
 │  │          │          │          │
 ▼  ▼          ▼          ▼          ▼
NLI Signals  Signals   Signals   Signals
 └──────────────┬──────────────────────────┘
                ▼
        Fusion Trust Model
                ▼
     Trust Calibration Engine
                ▼
      Verification Receipt
                ▼
         Verified Response
```

------------------------------------------------------------------------

# Pipeline Stages

## Stage 1 -- Request Intake

Responsibilities: - Authenticate request - Validate payload - Create
verification session - Initialize `VerificationState`

Inputs: - Prompt - Conversation context - Model configuration

Outputs: - Session ID - Initialized state

------------------------------------------------------------------------

## Stage 2 -- Response Generation

Component: - Response Agent

Models: - Qwen - Llama - Gemma - Mistral

Outputs: - Response text - Hidden states - Logits - Token metadata

------------------------------------------------------------------------

## Stage 3 -- Claim Extraction

Component: - Claim Extraction Agent

Responsibilities: - Split response into atomic claims - Preserve claim
order - Attach metadata

Outputs: - Claim list

------------------------------------------------------------------------

## Stage 4 -- Claim Classification

Component: - Claim Type Agent

Supported types: - FACTUAL - NUMERIC - TEMPORAL - LOGICAL - OPINION

Purpose: Route each claim to the appropriate verification strategy.

------------------------------------------------------------------------

## Stage 5 -- Parallel Verification

The following branches execute concurrently.

### Retrieval Branch

Pipeline: - BM25 - BGE / E5 embeddings - Hybrid merge - BGE reranker -
Evidence selection - DeBERTa-v3-MNLI

Outputs: - Evidence - Entailment score

### Semantic Branch

Runs: - Semantic Entropy Probe - Semantic Entropy - Kernel Language
Entropy

Outputs: - Uncertainty signals

### Symbolic Branch

Uses: - Python Arithmetic Engine - Z3 Solver

Outputs: - Deterministic verification results

### Temporal Branch

Checks: - Dates - Versions - Time-sensitive facts

Outputs: - Temporal validity

### Agreement Branch

Compares responses across: - Qwen - Llama - Gemma - Mistral

Outputs: - Agreement score

------------------------------------------------------------------------

# Signal Aggregation

All verification branches populate:

``` python
verification_signals = {
    "semantic": {},
    "retrieval": {},
    "nli": {},
    "symbolic": {},
    "temporal": {},
    "agreement": {}
}
```

LangGraph waits until all required branches complete before continuing.

------------------------------------------------------------------------

# Fusion Trust Stage

Component: - Fusion Trust Agent

Model: - Fusion Trust Model

Consumes: - Semantic signals - Retrieval confidence - NLI scores -
Symbolic results - Temporal validation - Agreement score

Produces: - Trust score - Risk level - Verification decision

------------------------------------------------------------------------

# Trust Calibration

Component: - Calibration Agent

Methods: - Isotonic Regression - Conformal Prediction

Purpose: Produce calibrated confidence estimates and prediction
intervals.

------------------------------------------------------------------------

# Receipt Generation

Component: - Receipt Agent

Receipt includes: - Session ID - Prompt - Response - Claims - Evidence
summary - Trust score - Calibration output - Timestamp - Audit metadata

------------------------------------------------------------------------

# Streaming Workflow

``` text
Prompt
  │
  ▼
Token Stream
  │
  ▼
Claim Extraction
  │
  ▼
Live Verification Events
  │
  ▼
Trust Score Updates
  │
  ▼
Final Receipt
```

The frontend receives progress through WebSockets or Server-Sent Events.

------------------------------------------------------------------------

# Error Handling

  Failure                     Strategy
  --------------------------- -----------------------------------
  LLM unavailable             Fallback model
  Retrieval timeout           Continue with reduced confidence
  Optional agent failure      Record warning
  Critical workflow failure   Abort and return structured error

------------------------------------------------------------------------

# Performance Goals

-   Parallel verification wherever possible
-   Stateless agent execution
-   Cached retrieval
-   Streaming-first UX
-   Independent model services

------------------------------------------------------------------------

# Design Principles

1.  Verification is independent of generation.
2.  Verification branches execute in parallel.
3.  Trust is computed only after signal aggregation.
4.  Confidence is calibrated before presentation.
5.  Every response produces an auditable receipt.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 09 defined the agent system.
-   **Chapter 10 defines the complete verification pipeline.**
-   Chapter 11 expands the architecture of the custom AI models that
    power verification.
