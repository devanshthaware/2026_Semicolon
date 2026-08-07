# 17_VECTOR_DATABASE.md

# TruthLayer System Design

## Chapter 17 -- Vector Database Architecture

**Version:** 1.0 **Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the vector database architecture used by TruthLayer
for semantic retrieval. It covers document ingestion, chunking,
embedding generation, indexing, metadata management, search execution,
and maintenance.

------------------------------------------------------------------------

# Objectives

-   Fast semantic search
-   High recall retrieval
-   Scalable vector storage
-   Rich metadata filtering
-   Incremental indexing
-   Explainable evidence retrieval

------------------------------------------------------------------------

# Architecture Overview

``` text
Documents
    │
    ▼
Document Parser
    │
    ▼
Chunking Engine
    │
    ▼
Embedding Generator
(BGE / E5)
    │
    ▼
Metadata Builder
    │
    ▼
Qdrant Collection
    │
    ▼
Vector Search
    │
    ▼
Top-K Results
```

------------------------------------------------------------------------

# Why a Vector Database?

The vector database enables semantic retrieval by storing dense
embeddings for document chunks.

Responsibilities:

-   Similarity search
-   Metadata filtering
-   Incremental updates
-   High-dimensional indexing
-   Fast nearest-neighbor retrieval

Recommended engine:

-   Qdrant

Optional alternatives:

-   FAISS
-   Milvus
-   Weaviate

------------------------------------------------------------------------

# Document Ingestion Pipeline

``` text
Raw Documents
      │
      ▼
File Loader
      │
      ▼
Parser
      │
      ▼
Cleaner
      │
      ▼
Chunk Generator
      │
      ▼
Embedding Generator
      │
      ▼
Vector Store
```

Supported document types:

-   PDF
-   Markdown
-   HTML
-   DOCX
-   TXT
-   JSON

------------------------------------------------------------------------

# Chunking Strategy

Goals:

-   Preserve semantic meaning
-   Minimize context loss
-   Improve retrieval precision

Recommended defaults:

-   Chunk size: 500--800 tokens
-   Overlap: 50--100 tokens

Metadata attached to every chunk:

-   document_id
-   chunk_id
-   title
-   source
-   author
-   created_at
-   embedding_version
-   checksum

------------------------------------------------------------------------

# Embedding Generation

Models:

-   BGE Large
-   BGE Base
-   E5 Large
-   E5 Base

Pipeline:

``` text
Chunk
   │
   ▼
Tokenizer
   │
   ▼
Embedding Model
   │
   ▼
768 / 1024-D Vector
```

------------------------------------------------------------------------

# Qdrant Collections

Recommended collections:

-   documents
-   documentation
-   knowledge_base
-   receipts_archive (optional)

Each collection stores:

-   Vector
-   Payload metadata
-   Collection configuration

------------------------------------------------------------------------

# Metadata Schema

Example payload:

``` json
{
  "document_id": "doc_001",
  "chunk_id": "chunk_042",
  "title": "TruthLayer Architecture",
  "source": "internal",
  "section": "Retrieval",
  "created_at": "2026-01-01",
  "embedding_version": "bge-large-v1"
}
```

------------------------------------------------------------------------

# Indexing Strategy

Use:

-   HNSW index
-   Cosine similarity

Recommended parameters:

-   M: 16--32
-   ef_construct: 100--300
-   ef_search: configurable

------------------------------------------------------------------------

# Search Workflow

``` text
Atomic Claim
      │
      ▼
Embedding Generator
      │
      ▼
Vector Search
      │
      ▼
Metadata Filter
      │
      ▼
Top-K Chunks
      │
      ▼
BGE Reranker
      │
      ▼
Evidence
```

------------------------------------------------------------------------

# Metadata Filtering

Supported filters:

-   Source
-   Document type
-   Language
-   Date
-   Collection
-   Tags
-   Organization (multi-tenant)

------------------------------------------------------------------------

# Incremental Updates

Workflow:

1.  Detect document changes.
2.  Re-chunk modified content.
3.  Regenerate embeddings.
4.  Upsert vectors.
5.  Remove obsolete chunks.

------------------------------------------------------------------------

# Performance Optimizations

-   Batch embedding generation
-   Parallel ingestion
-   Warm collections
-   Async indexing
-   Cached metadata
-   Background compaction

------------------------------------------------------------------------

# Backup & Recovery

Back up:

-   Collections
-   Payload metadata
-   Collection configuration

Recovery process:

1.  Restore snapshot.
2.  Validate metadata.
3.  Rebuild indexes if required.

------------------------------------------------------------------------

# Repository Structure

``` text
backend/storage/vector/
├── collections/
├── embeddings/
├── ingestion/
├── indexing/
├── search/
├── filters/
└── qdrant_client.py
```

------------------------------------------------------------------------

# Design Principles

1.  Dense retrieval complements BM25.
2.  Embeddings are versioned.
3.  Metadata is immutable after indexing.
4.  Chunk provenance is preserved.
5.  Vector search remains independent of verification logic.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 16 defined relational persistence.
-   **Chapter 17 defines the vector database architecture.**
-   Chapter 18 describes Redis caching and state management.
