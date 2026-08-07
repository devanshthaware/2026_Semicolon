# 04_CONTAINER_ARCHITECTURE.md

# TruthLayer System Design

## Chapter 4 -- Container Architecture

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter describes the **C4 Level 2 (Container)** architecture of
TruthLayer. A container is a deployable application or data store with a
well-defined responsibility and interface.

------------------------------------------------------------------------

# Container Overview

``` text
                         Users / SDK Clients
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │ Next.js Frontend    │
                      └─────────┬───────────┘
                                │ HTTPS / WS
                                ▼
                     ┌──────────────────────┐
                     │ FastAPI API Gateway  │
                     └─────────┬────────────┘
                               │
                               ▼
                  ┌──────────────────────────┐
                  │ LangGraph Runtime         │
                  │ Workflow Orchestrator     │
                  └───────┬─────────┬─────────┘
                          │         │
          ┌───────────────┘         └────────────────┐
          ▼                                          ▼
 ┌──────────────────┐                     ┌──────────────────┐
 │ Verification      │                     │ Retrieval Service│
 │ Agent Services    │                     │ BM25+BGE+Rerank │
 └─────────┬─────────┘                     └────────┬─────────┘
           │                                        │
           ▼                                        ▼
 ┌──────────────────┐                     ┌──────────────────┐
 │ Model Service    │                     │ Vector Database  │
 │ SEP/Fusion/etc.  │                     │ Qdrant / FAISS   │
 └─────────┬────────┘                     └──────────────────┘
           │
           ▼
 ┌──────────────────┐
 │ PostgreSQL/Redis │
 └──────────────────┘
```

------------------------------------------------------------------------

# Container Catalogue

## 1. Next.js Frontend

Purpose: - Website - Developer Console - Documentation - SDK Showcase -
Real-time visualization

Communicates with: - FastAPI Gateway

------------------------------------------------------------------------

## 2. FastAPI API Gateway

Responsibilities:

-   Authentication
-   API Keys
-   REST API
-   WebSocket
-   SSE Streaming
-   Request validation
-   Rate limiting

Does **not** execute business logic.

Delegates all workflows to LangGraph.

------------------------------------------------------------------------

## 3. LangGraph Runtime

Responsibilities:

-   Workflow orchestration
-   Shared VerificationState
-   Parallel execution
-   Retry handling
-   Agent routing

Owns the verification lifecycle.

------------------------------------------------------------------------

## 4. Verification Agent Services

Contains independent agents:

-   Response Agent
-   Claim Extraction Agent
-   Claim Type Agent
-   Retrieval Agent
-   NLI Agent
-   Semantic Agent
-   Symbolic Agent
-   Temporal Agent
-   Agreement Agent
-   Fusion Agent
-   Calibration Agent
-   Receipt Agent

Each agent is stateless.

------------------------------------------------------------------------

## 5. Model Service

Hosts custom ML models.

Models:

-   Semantic Entropy Probe
-   Fusion Trust Model
-   Claim Type Classifier
-   Claim Extraction Model
-   Claim Dependency Model
-   Trust Calibration

Frameworks:

-   PyTorch
-   LightGBM

------------------------------------------------------------------------

## 6. Retrieval Service

Pipeline:

1.  BM25
2.  Dense Embeddings (BGE/E5)
3.  Hybrid Merge
4.  BGE Reranker
5.  Evidence

------------------------------------------------------------------------

## 7. Vector Database

Recommended:

-   Qdrant

Optional:

-   FAISS

Stores:

-   Document embeddings
-   Chunk metadata

------------------------------------------------------------------------

## 8. PostgreSQL

Stores:

-   Users
-   Sessions
-   Receipts
-   Analytics
-   API Keys
-   Audit logs

------------------------------------------------------------------------

## 9. Redis

Stores:

-   Cache
-   Session state
-   Event streams
-   Rate limiting
-   Temporary graph state

------------------------------------------------------------------------

## 10. LangSmith

Responsibilities:

-   Tracing
-   Prompt history
-   Workflow visualization
-   Latency metrics
-   Error diagnostics

------------------------------------------------------------------------

# Container Interactions

  Source         Target           Purpose
  -------------- ---------------- -----------------------------
  Frontend       FastAPI          API requests & streaming
  FastAPI        LangGraph        Start verification workflow
  LangGraph      Agent Services   Execute verification
  Agents         Model Service    ML inference
  Retrieval      Vector DB        Evidence search
  LangGraph      PostgreSQL       Persist sessions & receipts
  LangGraph      Redis            Cache & coordination
  All Services   LangSmith        Observability

------------------------------------------------------------------------

# Deployment Strategy

Each container is independently deployable.

Recommended services:

-   frontend
-   api-gateway
-   langgraph-runtime
-   model-service
-   retrieval-service
-   postgres
-   redis
-   qdrant

Docker Compose for development.

Kubernetes for production.

------------------------------------------------------------------------

# Design Principles

1.  One responsibility per container.
2.  Loose coupling via APIs.
3.  Stateless services where possible.
4.  Independent scaling of compute-heavy containers.
5.  Model service isolated from API.
6.  Workflow centralized in LangGraph.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 03 defined external context.
-   **Chapter 04 defines deployable containers.**
-   Chapter 05 will decompose each container into internal components.
