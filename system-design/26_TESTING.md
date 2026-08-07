# 26_TESTING.md

# TruthLayer System Design

## Chapter 26 -- Testing & Quality Assurance

**Version:** 1.0 **Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the testing strategy for TruthLayer across
frontend, backend, AI models, workflows, infrastructure, and deployment.
The objective is to ensure every verification result is reliable,
reproducible, performant, and secure.

------------------------------------------------------------------------

# Testing Objectives

-   Validate correctness
-   Prevent regressions
-   Ensure workflow reliability
-   Verify AI model quality
-   Measure performance
-   Validate security controls
-   Support continuous delivery

------------------------------------------------------------------------

# Testing Pyramid

``` text
            End-to-End
          ───────────────
        Integration Tests
      ─────────────────────
        Unit Tests (Largest)
```

------------------------------------------------------------------------

# Testing Layers

  Layer         Scope                          Recommended Tools
  ------------- ------------------------------ -------------------------------
  Unit          Individual functions/classes   pytest, Jest
  Integration   Service interactions           pytest, Testcontainers
  API           REST/WebSocket/SSE             pytest, HTTPX
  Workflow      LangGraph execution            pytest
  AI Model      Model inference & metrics      PyTorch, scikit-learn
  Frontend      Components & UI                Vitest, React Testing Library
  E2E           Complete user journeys         Playwright
  Performance   Load & latency                 k6, Locust
  Security      Vulnerability checks           OWASP ZAP, Bandit

------------------------------------------------------------------------

# Backend Testing

Test:

-   FastAPI routes
-   Authentication
-   Authorization
-   Request validation
-   Repository layer
-   Database migrations
-   Redis integration
-   Qdrant integration

Coverage target: **90%+**

------------------------------------------------------------------------

# LangGraph Workflow Testing

Validate:

-   Node execution
-   Parallel branches
-   Retry logic
-   Conditional routing
-   Shared VerificationState
-   Checkpoint recovery
-   Failure handling

------------------------------------------------------------------------

# Agent Testing

Each verification agent must test:

-   Valid input
-   Invalid input
-   Empty state
-   Timeout behavior
-   Exception handling
-   State updates
-   Deterministic outputs (where applicable)

------------------------------------------------------------------------

# AI Model Validation

## Semantic Entropy Probe

Metrics:

-   Accuracy
-   Precision
-   Recall
-   F1
-   ROC-AUC

## Fusion Trust Model

Metrics:

-   RMSE
-   MAE
-   Calibration Error

## Claim Models

Metrics:

-   Accuracy
-   Macro F1
-   Exact Match
-   ROUGE/BLEU (Claim Extraction)

------------------------------------------------------------------------

# Retrieval Testing

Verify:

-   BM25 retrieval
-   Dense retrieval
-   Hybrid merge
-   Reranker output
-   Evidence ordering
-   NLI integration

Track:

-   Recall@K
-   Precision@K
-   MRR
-   nDCG

------------------------------------------------------------------------

# API Testing

Validate:

-   REST endpoints
-   Authentication
-   Error responses
-   Pagination
-   Streaming endpoints
-   Rate limiting
-   Version compatibility

------------------------------------------------------------------------

# Frontend Testing

Test:

-   Components
-   Pages
-   State management
-   API integration
-   Accessibility
-   Responsive layouts
-   Visual regressions

------------------------------------------------------------------------

# End-to-End Testing

Typical scenarios:

1.  User submits prompt.
2.  Verification executes.
3.  Trust score updates.
4.  Evidence displayed.
5.  Receipt generated.
6.  Session persisted.

------------------------------------------------------------------------

# Performance Testing

Measure:

-   Requests/sec
-   P95 latency
-   Model inference time
-   Retrieval latency
-   Concurrent sessions
-   Memory usage
-   CPU/GPU utilization

Acceptance criteria should be defined per release.

------------------------------------------------------------------------

# Security Testing

Perform:

-   Dependency scanning
-   SAST
-   DAST
-   Secret scanning
-   Authentication testing
-   Authorization testing
-   Rate-limit validation

------------------------------------------------------------------------

# Test Data

Use:

-   Synthetic datasets
-   Seed databases
-   Mock LLM responses
-   Mock retrieval indexes
-   Golden verification receipts

------------------------------------------------------------------------

# Continuous Testing

CI executes:

``` text
Commit
  │
  ▼
Lint
  ▼
Unit Tests
  ▼
Integration Tests
  ▼
Workflow Tests
  ▼
API Tests
  ▼
Frontend Tests
  ▼
Security Scan
  ▼
Performance Smoke Test
```

------------------------------------------------------------------------

# Repository Structure

``` text
tests/
├── unit/
├── integration/
├── api/
├── workflow/
├── agents/
├── models/
├── retrieval/
├── frontend/
├── e2e/
├── performance/
└── security/
```

------------------------------------------------------------------------

# Quality Gates

Release requirements:

-   Unit tests pass
-   Integration tests pass
-   E2E tests pass
-   Coverage threshold met
-   Security scan clean
-   Performance within SLA
-   Model metrics above deployment thresholds

------------------------------------------------------------------------

# Design Principles

1.  Test every layer independently.
2.  Automate all repeatable tests.
3.  Validate workflows, not just functions.
4.  Use production-like test environments.
5.  Block releases on critical failures.
6.  Continuously measure quality.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 25 defined CI/CD.
-   **Chapter 26 defines testing and quality assurance.**
-   Chapter 27 will define operations, maintenance, and platform
    governance.
