# BACKEND_ECOSYSTEM_SPECIFICATION.md

# Argus Python Backend Ecosystem

**Version:** 1.0

## Purpose

This document is the **single source of truth** for the complete Python
backend ecosystem of Argus. It explains how every service, agent,
pretrained component, custom AI model, and dataset work together during
training and inference.

------------------------------------------------------------------------

# Overall Architecture

``` text
                        Frontend (Next.js)
                               │
                    REST / WebSocket / SSE
                               │
                               ▼
                       FastAPI API Gateway
                               │
               Authentication / API Keys / Rate Limits
                               │
                               ▼
                    LangGraph Orchestrator Graph
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
  Session Service        Agent Workflow          Event Bus
        │                      │                      │
        ▼                      ▼                      ▼
 PostgreSQL              Verification Graph      Redis Streams
                               │
        ┌──────────────────────┼──────────────────────────────┐
        ▼                      ▼                              ▼
   LLM Service          Retrieval Service              Model Service
        │                      │                              │
        ▼                      ▼                              ▼
Qwen/Llama/Gemma       BM25 + BGE + Reranker          Custom Models
                               │                              │
                               └──────────────┬───────────────┘
                                              ▼
                                     Fusion Trust
                                              ▼
                                   Calibration & Receipt
                                              ▼
                                      Dashboard / SDK
```

------------------------------------------------------------------------

# Core Technologies

  Layer             Technology
  ----------------- -------------------
  API               FastAPI
  Workflow          LangGraph
  LLM Integration   LangChain
  Observability     LangSmith
  Database          PostgreSQL
  Cache             Redis
  Vector DB         Qdrant / FAISS
  Background Jobs   Celery / AsyncIO
  Custom ML         PyTorch, LightGBM
  Search            BM25
  Embeddings        BGE / E5

------------------------------------------------------------------------

# Backend Services

## API Gateway

-   Authentication
-   API Keys
-   Streaming
-   WebSockets
-   REST APIs

## Session Service

Maintains verification sessions.

## LLM Service

-   Qwen
-   Llama
-   Gemma
-   Mistral

Produces: - Response - Hidden states - Logits

## Retrieval Service

Pipeline: 1. BM25 retrieval 2. Dense embedding search (BGE/E5) 3. Merge
candidates 4. BGE Reranker 5. Return evidence

## Verification Services

-   NLI (DeBERTa-v3-MNLI)
-   Symbolic (Z3 + Python)
-   Temporal Validation
-   Cross-model comparison

## AI Model Service

Hosts all trainable Argus models.

------------------------------------------------------------------------

# Custom AI Models

## 1. Semantic Entropy Probe (SEP)

Dataset: - SEP_Dataset

Output: - Semantic entropy score - Hallucination probability

Framework: - PyTorch

------------------------------------------------------------------------

## 2. Fusion Trust Model

Dataset: - Fusion_Trust_Model_Datasets

Output: - Trust Score - Risk Level - Verification Decision

Framework: - LightGBM

------------------------------------------------------------------------

## 3. Claim Type Classifier

Dataset: - Claim_Type_Classifier

Purpose: Classify claims into: - FACTUAL - NUMERIC - TEMPORAL -
LOGICAL - OPINION

Current: Prompt-based or ML classifier.

------------------------------------------------------------------------

## 4. Claim Extraction Model

Dataset: - Claim_Extraction

Purpose: Convert responses into atomic claims.

Current: Prompt-based.

Future: Fine-tuned seq2seq model.

------------------------------------------------------------------------

## 5. Claim Dependency Model

Dataset: - Claim_Dependency

Purpose: Create dependency graph between claims.

Current: Graph heuristics.

Future: Graph Neural Network.

------------------------------------------------------------------------

## 6. Cross-Model Agreement

Dataset: - Cross_Model_Agreement

Purpose: Measure semantic agreement across multiple LLM outputs.

Current: Embeddings + Cosine + NLI.

------------------------------------------------------------------------

## 7. Trust Calibration (Conformal)

Dataset: - Trust_Calibration\_(Conformal)

Purpose: Calibrate Fusion Trust scores.

Method: - Isotonic Regression - Conformal Prediction

------------------------------------------------------------------------

# Dataset Repository

``` text
datasets/
│
├── SEP_Dataset/
│
├── Fusion_Trust_Model_Datasets/
│
├── Claim_Type_Classifier/
│
├── Claim_Extraction/
│
├── Claim_Dependency/
│
├── Cross_Model_Agreement/
│
└── Trust_Calibration_(Conformal)/
```

------------------------------------------------------------------------

# End-to-End Runtime Flow

``` text
User Prompt
    │
    ▼
FastAPI
    │
    ▼
LangGraph
    │
    ▼
LLM Service
    │
    ▼
Claim Extraction
    │
    ▼
Claim Type Classification
    │
 ┌──┬──────────┬─────────┬───────────────┐
 ▼  ▼          ▼         ▼               ▼
SEP Retrieval Symbolic Temporal Agreement
 │    │          │         │              │
 ▼    ▼          ▼         ▼              ▼
NLI  Evidence  Z3/Python  Rules     Embeddings
 └──────────────┬────────────────────────────┘
                ▼
        Fusion Trust Model
                ▼
     Trust Calibration Engine
                ▼
      Verification Receipt
                ▼
 Dashboard / SDK / API Response
```

------------------------------------------------------------------------

# Repository Layout

``` text
argus-backend/
│
├── api/
├── graph/
├── agents/
├── services/
│   ├── llm/
│   ├── retrieval/
│   ├── verification/
│   ├── analytics/
│   └── receipt/
│
├── models/
│   ├── semantic_entropy_probe/
│   ├── fusion_trust/
│   ├── claim_type_classifier/
│   ├── claim_extraction/
│   ├── claim_dependency/
│   ├── cross_model_agreement/
│   └── calibration/
│
├── datasets/
│   ├── SEP_Dataset/
│   ├── Fusion_Trust_Model_Datasets/
│   ├── Claim_Type_Classifier/
│   ├── Claim_Extraction/
│   ├── Claim_Dependency/
│   ├── Cross_Model_Agreement/
│   └── Trust_Calibration_(Conformal)/
│
├── storage/
├── schemas/
├── telemetry/
├── tests/
└── main.py
```

------------------------------------------------------------------------

# Architectural Principles

1.  FastAPI exposes APIs only.
2.  LangGraph owns workflow orchestration.
3.  LangChain wraps LLMs, retrievers, and tools.
4.  LangSmith traces every execution.
5.  Every agent has a single responsibility.
6.  Every custom model is isolated behind the Model Service.
7.  All verification signals converge in the Fusion Trust Model.
8.  Trust Calibration runs after Fusion and before receipt generation.
9.  The dataset folders shown above are the canonical training datasets
    for each custom model.
