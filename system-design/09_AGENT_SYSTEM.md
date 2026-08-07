# 09_AGENT_SYSTEM.md

# Argus System Design

## Chapter 9 -- Agent System

**Version:** 1.0 **Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter specifies the verification agent architecture used by
Argus. Agents perform specialized verification tasks and
collaborate through a shared `VerificationState` orchestrated by
LangGraph.

------------------------------------------------------------------------

# Agent Design Principles

-   Single responsibility per agent
-   Stateless execution
-   Shared workflow state
-   Independent testing
-   Parallel execution where possible
-   Replaceable implementations

------------------------------------------------------------------------

# Agent Lifecycle

``` text
VerificationState
        │
        ▼
 Read State
        │
        ▼
 Execute Task
        │
        ▼
 Update State
        │
        ▼
 Return Control
```

------------------------------------------------------------------------

# Agent Registry

  Agent               Purpose                         Parallel
  ------------------- ------------------------------- ----------
  Orchestrator        Manage workflow                 No
  Response            Generate LLM response           No
  Claim Extraction    Produce atomic claims           No
  Claim Type          Route claims                    No
  Retrieval           Retrieve evidence               Yes
  NLI                 Verify evidence                 Yes
  Semantic Analysis   Compute uncertainty             Yes
  Symbolic            Verify math & logic             Yes
  Temporal            Validate time-sensitive facts   Yes
  Agreement           Compare LLM outputs             Yes
  Fusion Trust        Compute trust score             No
  Calibration         Calibrate trust                 No
  Receipt             Generate receipt                No

------------------------------------------------------------------------

# Shared State

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
```

------------------------------------------------------------------------

# Agent Specifications

## 1. Orchestrator Agent

Framework: - LangGraph

Responsibilities: - Initialize workflow - Route nodes - Merge parallel
branches - Handle retries - Finalize execution

Input: - User request

Output: - VerificationState

------------------------------------------------------------------------

## 2. Response Agent

Uses: - Qwen - Llama - Gemma - Mistral

Produces: - Response - Hidden states - Logits

Updates: - response

------------------------------------------------------------------------

## 3. Claim Extraction Agent

Purpose: Split responses into atomic claims.

Input: - Response

Output: - Claims

Updates: - claims

------------------------------------------------------------------------

## 4. Claim Type Agent

Purpose: Categorize claims.

Labels: - FACTUAL - NUMERIC - TEMPORAL - LOGICAL - OPINION

Updates routing metadata.

------------------------------------------------------------------------

## 5. Retrieval Agent

Uses: - BM25 - BGE / E5 - Qdrant - BGE Reranker

Produces: - Evidence list

Updates: - evidence

------------------------------------------------------------------------

## 6. NLI Agent

Uses: - DeBERTa-v3-MNLI

Produces: - Entailment - Neutral - Contradiction - Confidence

Updates: - verification_signals\["nli"\]

------------------------------------------------------------------------

## 7. Semantic Analysis Agent

Runs: - Semantic Entropy Probe - Semantic Entropy - Kernel Language
Entropy

Updates: - verification_signals\["semantic"\]

------------------------------------------------------------------------

## 8. Symbolic Agent

Uses: - Python Arithmetic Engine - Z3 Solver

Verifies: - Arithmetic - Logic - Constraints

Updates: - verification_signals\["symbolic"\]

------------------------------------------------------------------------

## 9. Temporal Agent

Checks: - Dates - Versions - Time-sensitive facts

Updates: - verification_signals\["temporal"\]

------------------------------------------------------------------------

## 10. Agreement Agent

Uses: - Multiple LLM responses - Embeddings - Cosine similarity - NLI

Updates: - verification_signals\["agreement"\]

------------------------------------------------------------------------

## 11. Fusion Trust Agent

Uses: - Fusion Trust Model

Consumes: - All verification signals

Produces: - trust_score - risk_level

------------------------------------------------------------------------

## 12. Calibration Agent

Uses: - Isotonic Regression - Conformal Prediction

Produces: - Calibrated confidence

Updates: - verification_signals\["calibration"\]

------------------------------------------------------------------------

## 13. Receipt Agent

Produces: - Verification receipt - Evidence summary - Audit metadata

Updates: - receipt

------------------------------------------------------------------------

# Parallel Execution

``` text
Claim Type
    │
    ├────────────── Parallel ──────────────┐
    ▼      ▼        ▼         ▼           ▼
Retrieval Semantic Symbolic Temporal Agreement
    │      │        │         │           │
    └────────────── Merge ─────────────────┘
                   │
                   ▼
             Fusion Trust
                   ▼
             Calibration
                   ▼
               Receipt
```

------------------------------------------------------------------------

# Failure Handling

-   Timeout → Retry once
-   Retrieval unavailable → Continue with reduced confidence
-   Optional agent failure → Record warning
-   Critical failure → End workflow safely

------------------------------------------------------------------------

# Interfaces

Each agent exposes a common interface:

``` python
class VerificationAgent:
    def run(self, state: VerificationState) -> VerificationState:
        ...
```

------------------------------------------------------------------------

# Observability

Every execution records: - Inputs - Outputs - Duration - Errors - Token
usage (where applicable)

Captured through LangSmith traces.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 08 defined the LangGraph workflow.
-   **Chapter 09 defines the verification agent system.**
-   Chapter 10 describes the end-to-end verification pipeline.
