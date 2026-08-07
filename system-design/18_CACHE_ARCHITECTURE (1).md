# 18_CACHE_ARCHITECTURE.md

# TruthLayer System Design

## Chapter 18 -- Cache Architecture

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the caching architecture used by TruthLayer. It
describes how Redis is used to improve performance, coordinate
distributed workflows, support streaming, and reduce repeated
computation.

------------------------------------------------------------------------

# Objectives

-   Reduce latency
-   Minimize repeated computation
-   Support distributed workflows
-   Enable real-time streaming
-   Improve scalability
-   Preserve consistency

------------------------------------------------------------------------

# High-Level Architecture

``` text
                 FastAPI
                    │
                    ▼
              LangGraph Runtime
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
   Session Cache  Event Bus  Retrieval Cache
         │          │          │
         └──────────┼──────────┘
                    ▼
                  Redis
```

------------------------------------------------------------------------

# Why Redis?

Redis is an in-memory data store used for:

-   Session state
-   Workflow checkpoints
-   Streaming events
-   API rate limiting
-   Retrieval caching
-   Distributed locks
-   Temporary verification state

Redis is **not** the system of record. Persistent data remains in
PostgreSQL and Qdrant.

------------------------------------------------------------------------

# Cache Layers

## Request Cache

Stores short-lived request metadata.

## Session Cache

Stores active verification sessions.

## Workflow Cache

Stores LangGraph checkpoints.

## Retrieval Cache

Caches recent retrieval results.

## Streaming Cache

Buffers events for WebSocket/SSE clients.

## Rate Limit Cache

Tracks API quotas and request counts.

------------------------------------------------------------------------

# Cache Keys

Suggested naming:

``` text
session:{id}
workflow:{id}
receipt:{id}
retrieval:{claim_hash}
embedding:{text_hash}
apikey:{id}
ratelimit:{user_id}
stream:{session_id}
```

------------------------------------------------------------------------

# TTL Policy

  Cache        Suggested TTL
  ------------ -------------------
  Request      5 minutes
  Session      1 hour
  Workflow     1 hour
  Retrieval    24 hours
  Streaming    Until completion
  Rate Limit   Rolling window
  Embedding    7 days (optional)

------------------------------------------------------------------------

# Session Lifecycle

``` text
Request
   │
   ▼
Create Session
   │
   ▼
Cache Session
   │
   ▼
Update During Workflow
   │
   ▼
Persist Receipt
   │
   ▼
Expire Cache
```

------------------------------------------------------------------------

# LangGraph Checkpointing

Checkpoint after:

1.  Response generation
2.  Claim extraction
3.  Parallel verification
4.  Fusion Trust
5.  Receipt generation

Allows retries and recovery without restarting the workflow.

------------------------------------------------------------------------

# Retrieval Cache

Cache key is derived from a normalized claim hash.

Stores:

-   Candidate documents
-   Reranked evidence
-   Metadata
-   Retrieval scores

------------------------------------------------------------------------

# Streaming Events

Redis Pub/Sub (or Streams) distributes:

-   session.started
-   response.generated
-   claims.extracted
-   verification.progress
-   trust.updated
-   receipt.created
-   session.completed

------------------------------------------------------------------------

# Distributed Coordination

Redis supports:

-   Worker coordination
-   Distributed locks
-   Background jobs
-   Event fan-out

------------------------------------------------------------------------

# Cache Invalidation

Invalidate when:

-   Source documents change
-   Embedding model changes
-   Verification workflow version changes
-   Session completes
-   TTL expires

------------------------------------------------------------------------

# Monitoring

Track:

-   Hit ratio
-   Miss ratio
-   Memory usage
-   Evictions
-   Expired keys
-   Latency
-   Connected clients

------------------------------------------------------------------------

# Security

-   TLS
-   Authentication
-   Network isolation
-   No long-term secrets
-   Sensitive values encrypted before caching

------------------------------------------------------------------------

# Repository Structure

``` text
backend/storage/cache/
├── redis_client.py
├── session_cache.py
├── retrieval_cache.py
├── event_bus.py
├── rate_limit.py
└── cache_keys.py
```

------------------------------------------------------------------------

# Design Principles

1.  Redis is ephemeral.
2.  PostgreSQL remains the source of truth.
3.  Cache failures must not break verification.
4.  Keys follow consistent naming conventions.
5.  TTLs are explicit and documented.
6.  Cache invalidation is event-driven wherever possible.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 17 defined the vector database.
-   **Chapter 18 defines Redis caching and state management.**
-   Chapter 19 describes the API design and external interfaces.
