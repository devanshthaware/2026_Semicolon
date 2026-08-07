# 05_COMPONENT_ARCHITECTURE.md

# TruthLayer System Design

## Chapter 5 -- Component Architecture

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter describes the internal components that make up each major
container defined in Chapter 4. While containers are independently
deployable units, components are logical building blocks within those
containers.

------------------------------------------------------------------------

# Component Hierarchy

``` text
Next.js Frontend
│
├── Landing UI
├── Console UI
├── Documentation
├── SDK Showcase
└── Visualization

FastAPI Gateway
│
├── Auth
├── API Router
├── Streaming
├── Rate Limiter
├── Request Validator
└── Error Handler

LangGraph Runtime
│
├── Workflow Engine
├── State Manager
├── Scheduler
├── Retry Manager
└── Event Dispatcher

Verification Agents
│
├── Response Agent
├── Claim Extraction Agent
├── Claim Type Agent
├── Retrieval Agent
├── NLI Agent
├── Semantic Agent
├── Symbolic Agent
├── Temporal Agent
├── Agreement Agent
├── Fusion Agent
├── Calibration Agent
└── Receipt Agent

Model Service
│
├── Model Loader
├── Inference Engine
├── Model Registry
├── GPU Manager
└── Version Manager

Retrieval Service
│
├── Query Processor
├── BM25 Retriever
├── Dense Retriever
├── Hybrid Merger
├── BGE Reranker
└── Evidence Formatter
```

------------------------------------------------------------------------

# Frontend Components

## Landing UI

Public marketing website.

## Console UI

Interactive verification dashboard.

## Documentation

Developer guides and API references.

## SDK Showcase

Interactive SDK demonstrations.

## Visualization

Displays verification graphs, trust scores, receipts, and timelines.

------------------------------------------------------------------------

# FastAPI Components

## Authentication

JWT and API key validation.

## API Router

Maps requests to workflows.

## Streaming Manager

Streams verification progress using WebSockets or SSE.

## Request Validator

Validates payloads using Pydantic.

## Rate Limiter

Protects public APIs.

## Error Handler

Normalizes API errors.

------------------------------------------------------------------------

# LangGraph Components

## Workflow Engine

Defines the verification graph.

## State Manager

Maintains shared VerificationState.

## Scheduler

Runs parallel branches.

## Retry Manager

Retries failed nodes according to policy.

## Event Dispatcher

Publishes workflow events.

------------------------------------------------------------------------

# Verification Agent Components

Each agent has one responsibility.

  Agent              Responsibility
  ------------------ -------------------------------
  Response           Generate LLM response
  Claim Extraction   Produce atomic claims
  Claim Type         Categorize claims
  Retrieval          Find supporting evidence
  NLI                Verify evidence
  Semantic           Compute uncertainty
  Symbolic           Verify math and logic
  Temporal           Validate time-sensitive facts
  Agreement          Compare multiple LLM outputs
  Fusion             Produce trust score
  Calibration        Calibrate confidence
  Receipt            Build verification receipt

------------------------------------------------------------------------

# Model Service Components

## Model Loader

Loads trained models into memory.

## Inference Engine

Executes predictions.

## Model Registry

Tracks available model versions.

## GPU Manager

Allocates compute resources.

## Version Manager

Supports model upgrades and rollback.

------------------------------------------------------------------------

# Retrieval Components

Pipeline:

``` text
Claim
  │
  ▼
Query Processor
  │
  ├── BM25 Retriever
  ├── Dense Retriever
  ▼
Hybrid Merger
  ▼
BGE Reranker
  ▼
Evidence Formatter
```

------------------------------------------------------------------------

# Shared Verification State

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

Every component reads and/or updates this shared state.

------------------------------------------------------------------------

# Component Interaction Flow

``` text
API Router
   │
   ▼
Workflow Engine
   │
   ▼
Response Agent
   │
   ▼
Claim Extraction
   │
   ▼
Claim Type
   │
   ├──────────────┬──────────────┬───────────────┐
   ▼              ▼              ▼               ▼
Retrieval     Semantic      Symbolic       Temporal
   │              │              │               │
   ▼              ▼              ▼               ▼
 NLI         Verification Signals         Agreement
         └──────────────┬────────────────────────┘
                        ▼
                 Fusion Agent
                        ▼
                Calibration Agent
                        ▼
                  Receipt Agent
```

------------------------------------------------------------------------

# Design Principles

1.  Components have a single responsibility.
2.  Components communicate through defined interfaces.
3.  Shared workflow state is owned by LangGraph.
4.  Business logic remains outside the API layer.
5.  Model inference is isolated from orchestration.
6.  Components are independently testable.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 04 defined deployable containers.
-   **Chapter 05 defines internal component boundaries.**
-   Chapter 06 will detail the backend architecture and package
    organization.
