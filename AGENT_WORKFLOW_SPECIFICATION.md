# AGENT_WORKFLOW_SPECIFICATION.md

# Argus Agent Workflow Specification

**Version:** 1.0

## Purpose

This document is the source of truth for the agent architecture used by
Argus. It defines how agents collaborate using **LangChain**,
**LangGraph**, and **LangSmith** to perform real-time AI verification.

------------------------------------------------------------------------

# Technology Stack

  Technology         Purpose
  ------------------ -----------------------------------------------
  LangGraph          Workflow orchestration and state management
  LangChain          Agent/tool abstraction and model integration
  LangSmith          Tracing, debugging, evaluation, observability
  FastAPI            API gateway
  Redis              Shared cache and state
  Celery / AsyncIO   Parallel execution
  PostgreSQL         Session metadata
  Qdrant / FAISS     Vector retrieval

------------------------------------------------------------------------

# High-Level Workflow

``` text
User Prompt
      │
      ▼
 LangGraph Orchestrator
      │
      ▼
 Response Agent (LLM)
      │
      ▼
 Claim Extraction Agent
      │
 ┌────┼───────────────┬─────────────┬─────────────┐
 ▼    ▼               ▼             ▼             ▼
Retrieval  Semantic  Symbolic   Temporal   Agreement
 Agent      Agent      Agent      Agent      Agent
  │          │          │           │          │
  ▼          ▼          ▼           ▼          ▼
NLI      SEP Model     Z3      Date Rules  Embeddings
  └──────────┴──────────┴──────────┴──────────┘
                     ▼
            Fusion Trust Agent
                     ▼
           Calibration Agent
                     ▼
             Receipt Agent
                     ▼
             Verified Response
```

------------------------------------------------------------------------

# Shared State (LangGraph)

Every node reads and updates a shared `VerificationState`.

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

# Agent Specifications

## 1. Orchestrator Agent

### Framework

LangGraph

### Responsibilities

-   Initialize state
-   Route execution
-   Execute independent branches in parallel
-   Merge outputs
-   Handle retries/failures

Input: - User prompt

Output: - VerificationState

------------------------------------------------------------------------

## 2. Response Agent

Framework: LangChain

Uses: - Qwen - Llama - Gemma - Mistral

Produces: - Response - Hidden states - Logits

Updates: - state.response

------------------------------------------------------------------------

## 3. Claim Extraction Agent

Framework: LangChain Runnable

Uses: - Prompt template - (Future) Fine-tuned extractor

Updates: - state.claims

------------------------------------------------------------------------

## 4. Retrieval Agent

Uses: - BM25 - BGE Embeddings - Vector Store - BGE Reranker

Output: Relevant evidence per claim.

Updates: - state.evidence

------------------------------------------------------------------------

## 5. NLI Agent

Uses: - DeBERTa-v3-MNLI

Input: - Claim - Evidence

Output: - Entailment - Neutral - Contradiction

Updates: - state.verification_signals\["nli"\]

------------------------------------------------------------------------

## 6. Semantic Analysis Agent

Runs: - Semantic Entropy Probe - Semantic Entropy - Kernel Language
Entropy

Updates: - state.verification_signals\["semantic"\]

------------------------------------------------------------------------

## 7. Symbolic Agent

Uses: - Python Arithmetic Engine - Z3 Solver

Verifies: - Numeric claims - Logical constraints

Updates: - state.verification_signals\["symbolic"\]

------------------------------------------------------------------------

## 8. Temporal Agent

Checks: - Dates - Versions - Time-sensitive facts

Updates: - state.verification_signals\["temporal"\]

------------------------------------------------------------------------

## 9. Cross-Model Agreement Agent

Uses: - Multiple LLM outputs - Embeddings - Cosine similarity - NLI

Updates: - state.verification_signals\["agreement"\]

------------------------------------------------------------------------

## 10. Fusion Trust Agent

Uses: - Fusion Trust Model

Consumes every verification signal.

Produces: - Trust score - Risk level

Updates: - state.trust_score

------------------------------------------------------------------------

## 11. Calibration Agent

Uses: - Isotonic Regression - Conformal Prediction

Produces: - Calibrated confidence interval

Updates: - state.verification_signals\["calibration"\]

------------------------------------------------------------------------

## 12. Receipt Agent

Produces: - Verification receipt - Audit metadata - Evidence summary -
Downloadable JSON

Updates: - state.receipt

------------------------------------------------------------------------

# LangGraph Flow

``` text
START
  │
  ▼
Response
  │
  ▼
Claim Extraction
  │
  ├────────────── Parallel ──────────────┐
  ▼      ▼        ▼         ▼            ▼
Retrieve Semantic Symbolic Temporal Agreement
  ▼      ▼        ▼         ▼            ▼
NLI      │        │         │            │
  └──────────── Merge ───────────────────┘
                │
                ▼
        Fusion Trust
                ▼
         Calibration
                ▼
            Receipt
                ▼
               END
```

------------------------------------------------------------------------

# LangChain Usage

-   Prompt templates
-   Model wrappers
-   Output parsers
-   Tool abstractions
-   Runnable chains

Each verification agent is implemented as an independent Runnable.

------------------------------------------------------------------------

# LangSmith Usage

Trace every execution.

Track: - Latency - Tokens - Prompt versions - Agent outputs - Errors -
Intermediate states - Evaluation scores

Each verification session corresponds to one LangSmith trace.

------------------------------------------------------------------------

# Parallel Execution Strategy

Parallel agents: - Retrieval - Semantic - Symbolic - Temporal -
Agreement

Sequential agents: - Response - Claim Extraction - Fusion -
Calibration - Receipt

------------------------------------------------------------------------

# Failure Handling

-   Agent timeout → retry once.
-   Agent unavailable → continue with reduced confidence.
-   Missing evidence → lower retrieval confidence.
-   LLM failure → terminate session with error.

------------------------------------------------------------------------

# Design Principles

1.  Agents are stateless.
2.  Shared state is owned by LangGraph.
3.  Each agent has a single responsibility.
4.  Fusion Trust Agent is the only authority for final trust.
5.  LangSmith traces every node for observability.
6.  New agents can be added without changing existing interfaces.
