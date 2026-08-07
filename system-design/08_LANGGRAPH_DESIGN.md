# 08_LANGGRAPH_DESIGN.md

# Argus System Design

## Chapter 8 -- LangGraph Design

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines how LangGraph orchestrates the Argus
verification workflow. LangGraph owns execution, shared state,
branching, retries, and synchronization between verification agents.

------------------------------------------------------------------------

# Why LangGraph?

LangGraph is responsible for:

-   Workflow orchestration
-   Shared state management
-   Parallel execution
-   Conditional routing
-   Retry policies
-   Checkpointing
-   Human-in-the-loop support (future)

FastAPI handles transport only.

------------------------------------------------------------------------

# Graph Overview

``` text
START
  │
  ▼
Initialize Session
  │
  ▼
Response Agent
  │
  ▼
Claim Extraction
  │
  ▼
Claim Type Classification
  │
  ├────────────── Parallel ───────────────┐
  ▼         ▼         ▼         ▼         ▼
Retrieval Semantic Symbolic Temporal Agreement
  │         │         │         │         │
  ▼         ▼         ▼         ▼         ▼
 NLI      Signals   Signals   Signals   Signals
  └───────────────────── Merge ─────────────────────┘
                         │
                         ▼
                 Fusion Trust Agent
                         │
                         ▼
                Trust Calibration
                         │
                         ▼
                 Receipt Generation
                         │
                         ▼
                        END
```

------------------------------------------------------------------------

# VerificationState

``` python
class VerificationState:
    session_id: str
    prompt: str
    response: str
    claims: list
    evidence: list
    verification_signals: dict
    trust_score: float
    risk_level: str
    receipt: dict
    metadata: dict
```

Every node reads and updates this shared state.

------------------------------------------------------------------------

# Graph Nodes

  Node               Responsibility
  ------------------ ---------------------------
  Initialize         Create session and state
  Response           Generate LLM response
  Claim Extraction   Produce atomic claims
  Claim Type         Route claims
  Retrieval          Retrieve evidence
  NLI                Entailment verification
  Semantic           SEP + uncertainty signals
  Symbolic           Z3 / arithmetic checks
  Temporal           Time-sensitive validation
  Agreement          Multi-model agreement
  Fusion             Compute trust score
  Calibration        Calibrate trust
  Receipt            Generate receipt

------------------------------------------------------------------------

# Parallel Branches

The following nodes execute concurrently:

-   Retrieval
-   Semantic Analysis
-   Symbolic Verification
-   Temporal Validation
-   Cross-Model Agreement

LangGraph waits for all branches before invoking the Fusion node.

------------------------------------------------------------------------

# Conditional Routing

``` text
Claim Type
   │
   ├── FACTUAL ──► Retrieval + NLI
   ├── NUMERIC ──► Python Arithmetic
   ├── LOGICAL ──► Z3 Solver
   ├── TEMPORAL ─► Temporal Validation
   └── OPINION ──► Lightweight Verification
```

------------------------------------------------------------------------

# Retry Policy

-   External API failure → retry once.
-   Retrieval timeout → continue with reduced confidence.
-   Model unavailable → fallback model if configured.
-   Agent exception → record failure in state and continue where safe.

------------------------------------------------------------------------

# Checkpointing

State checkpoints are written after:

1.  Response generation
2.  Claim extraction
3.  Parallel verification completion
4.  Fusion trust computation
5.  Receipt generation

------------------------------------------------------------------------

# Events

The graph emits lifecycle events:

-   session.started
-   response.generated
-   claims.extracted
-   verification.progress
-   trust.updated
-   receipt.created
-   session.completed

These events can be streamed to the frontend through WebSockets or SSE.

------------------------------------------------------------------------

# LangChain Integration

LangChain is used to provide:

-   Prompt templates
-   Runnable wrappers
-   Tool invocation
-   LLM adapters
-   Output parsers
-   Retriever abstractions

LangGraph orchestrates these runnable components.

------------------------------------------------------------------------

# LangSmith Integration

Each graph execution creates a trace containing:

-   Prompt
-   Node execution order
-   Inputs and outputs
-   Latency
-   Errors
-   Token usage
-   Final verification result

------------------------------------------------------------------------

# Graph Execution Lifecycle

``` text
Request
  │
  ▼
Initialize State
  │
  ▼
Execute Graph
  │
  ▼
Parallel Verification
  │
  ▼
Merge Signals
  │
  ▼
Fusion Trust
  │
  ▼
Calibration
  │
  ▼
Receipt
  │
  ▼
Stream Response
```

------------------------------------------------------------------------

# Design Principles

1.  LangGraph is the single workflow engine.
2.  All agents are stateless.
3.  State is centralized in VerificationState.
4.  Parallel work is preferred where dependencies allow.
5.  Every node is independently testable.
6.  Observability is enabled for every graph execution.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 07 defined the frontend architecture.
-   **Chapter 08 defines the LangGraph workflow and state machine.**
-   Chapter 09 expands the design of individual verification agents.
