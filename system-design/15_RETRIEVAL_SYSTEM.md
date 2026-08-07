# 15_RETRIEVAL_SYSTEM.md

# TruthLayer System Design

## Chapter 15 -- Retrieval System

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the hybrid retrieval architecture used by
TruthLayer to ground AI-generated claims with supporting evidence before
trust scoring.

------------------------------------------------------------------------

# Objectives

-   High recall
-   High precision
-   Low latency
-   Explainable evidence
-   Source traceability
-   Modular retrieval components

------------------------------------------------------------------------

# Retrieval Architecture

``` text
Atomic Claim
     │
     ▼
Query Processor
     │
     ├──────────────┐
     ▼              ▼
 BM25 Search   Dense Search
                (BGE / E5)
     │              │
     └──────┬───────┘
            ▼
      Hybrid Merge
            ▼
      BGE Reranker
            ▼
   Evidence Selection
            ▼
   DeBERTa-v3-MNLI
            ▼
Verification Signals
```

------------------------------------------------------------------------

# Retrieval Workflow

1.  Receive an atomic claim.
2.  Normalize and enrich the query.
3.  Execute sparse retrieval (BM25).
4.  Execute dense retrieval (BGE/E5 embeddings).
5.  Merge candidate documents.
6.  Re-rank candidates with the BGE Reranker.
7.  Select top-K evidence.
8.  Send evidence to the NLI stage.
9.  Return evidence and confidence to the Fusion Trust Model.

------------------------------------------------------------------------

# Components

## Query Processor

Responsibilities: - Normalize text - Remove noise - Expand queries
(future) - Build retrieval request

------------------------------------------------------------------------

## Sparse Retrieval

Technology: - BM25

Strengths: - Exact keyword matching - Fast retrieval - High lexical
recall

Output: - Candidate documents with lexical scores

------------------------------------------------------------------------

## Dense Retrieval

Technology: - BGE / E5 Embeddings

Responsibilities: - Encode claims - Encode documents - Perform vector
similarity search

Recommended Vector Database: - Qdrant

Optional: - FAISS

Output: - Semantic nearest neighbors

------------------------------------------------------------------------

## Hybrid Merge

Responsibilities: - Combine sparse and dense candidates - Remove
duplicates - Normalize scores - Preserve provenance

------------------------------------------------------------------------

## Reranking

Technology: - BGE Reranker

Responsibilities: - Score query-document relevance - Produce ranked
evidence list - Improve precision before NLI

------------------------------------------------------------------------

## Evidence Selection

Recommended output: - Top 3--10 passages - Relevance score - Source
metadata - Chunk identifier

Evidence is attached to the verification receipt.

------------------------------------------------------------------------

## NLI Verification

Technology: - DeBERTa-v3-MNLI

Inputs: - Claim - Evidence

Outputs: - Entailment - Neutral - Contradiction - Confidence

These signals are forwarded to the Fusion Trust Model.

------------------------------------------------------------------------

# Data Flow

``` text
Claim
  │
  ▼
Normalize Query
  │
  ▼
BM25 + Dense Search
  │
  ▼
Hybrid Merge
  │
  ▼
BGE Reranker
  │
  ▼
Top-K Evidence
  │
  ▼
NLI Verification
  │
  ▼
Fusion Trust
```

------------------------------------------------------------------------

# Indexing Strategy

Document pipeline:

``` text
Documents
   │
   ▼
Chunking
   │
   ▼
Embedding Generation
   │
   ▼
Vector Index
   │
   ▼
Metadata Storage
```

Metadata should include: - Document ID - Source - Chunk ID - Timestamp -
Embedding version

------------------------------------------------------------------------

# Caching

Redis caches: - Frequent queries - Embeddings (optional) - Retrieval
responses - Metadata lookups

------------------------------------------------------------------------

# Performance Goals

-   Parallel sparse and dense retrieval
-   Top-K reranking
-   Warm vector indexes
-   Incremental indexing
-   Low-latency evidence retrieval

------------------------------------------------------------------------

# Failure Handling

  Failure                 Strategy
  ----------------------- ---------------------------------
  Vector DB unavailable   Use BM25 only
  BM25 unavailable        Use dense retrieval only
  No evidence found       Return low retrieval confidence
  Reranker timeout        Use merged ranking

------------------------------------------------------------------------

# Design Principles

1.  Hybrid retrieval by default.
2.  Retrieval remains independent of LLM generation.
3.  Evidence must be traceable.
4.  Reranking precedes NLI.
5.  Retrieval outputs are explainable and auditable.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 14 defined the inference pipeline.
-   **Chapter 15 defines the hybrid retrieval system.**
-   Chapter 16 describes the relational database design and persistence
    architecture.
