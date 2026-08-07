# 16_DATABASE_DESIGN.md

# TruthLayer System Design

## Chapter 16 -- Database Design

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the relational persistence architecture for
TruthLayer. It describes the PostgreSQL schema, entity relationships,
data ownership, lifecycle, and persistence strategy for users,
verification sessions, receipts, analytics, and platform administration.

------------------------------------------------------------------------

# Objectives

-   Normalize operational data
-   Maintain auditability
-   Support horizontal scaling
-   Enable analytics
-   Preserve verification history
-   Keep model artifacts separate from transactional data

------------------------------------------------------------------------

# Persistence Architecture

``` text
                FastAPI
                   │
                   ▼
            Repository Layer
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
 PostgreSQL      Redis       Qdrant
Transactional    Cache      Embeddings
```

------------------------------------------------------------------------

# Storage Responsibilities

## PostgreSQL

Stores:

-   Users
-   Organizations
-   API Keys
-   Sessions
-   Verification Requests
-   Atomic Claims
-   Evidence Metadata
-   Verification Signals
-   Receipts
-   Audit Logs
-   Analytics

## Redis

Stores:

-   Session cache
-   Workflow checkpoints
-   Rate limits
-   Streaming events

## Qdrant

Stores:

-   Document embeddings
-   Chunk metadata
-   Vector indexes

------------------------------------------------------------------------

# Core Entity Relationship

``` text
Organization
      │
      ├──────── Users
      │             │
      │             ├──── API Keys
      │             │
      │             └──── Verification Sessions
      │                         │
      │                         ├──── Requests
      │                         ├──── Claims
      │                         ├──── Signals
      │                         ├──── Evidence
      │                         └──── Receipt
      │
      └──────── Analytics
```

------------------------------------------------------------------------

# Core Tables

## organizations

Purpose: Multi-tenant ownership.

Suggested fields:

-   id
-   name
-   slug
-   plan
-   created_at
-   updated_at

------------------------------------------------------------------------

## users

Purpose: Authentication and ownership.

Fields:

-   id
-   organization_id
-   email
-   name
-   role
-   status
-   created_at

------------------------------------------------------------------------

## api_keys

Fields:

-   id
-   user_id
-   name
-   key_hash
-   scopes
-   expires_at
-   last_used_at

------------------------------------------------------------------------

## verification_sessions

Purpose:

Tracks every verification workflow.

Fields:

-   id
-   user_id
-   request_id
-   workflow_version
-   status
-   started_at
-   completed_at
-   latency_ms

------------------------------------------------------------------------

## verification_requests

Fields:

-   id
-   session_id
-   prompt
-   model_name
-   temperature
-   response_text
-   token_count

------------------------------------------------------------------------

## claims

Stores atomic claims.

Fields:

-   id
-   session_id
-   claim_index
-   claim_text
-   claim_type

------------------------------------------------------------------------

## evidence

Stores evidence metadata.

Fields:

-   id
-   claim_id
-   document_id
-   chunk_id
-   source
-   retrieval_score
-   rerank_score

------------------------------------------------------------------------

## verification_signals

Fields:

-   id
-   claim_id
-   semantic_score
-   retrieval_score
-   nli_score
-   symbolic_score
-   temporal_score
-   agreement_score

------------------------------------------------------------------------

## receipts

Stores verification receipts.

Fields:

-   id
-   session_id
-   trust_score
-   calibrated_score
-   risk_level
-   receipt_json
-   generated_at

------------------------------------------------------------------------

## audit_logs

Tracks administrative actions.

Fields:

-   id
-   actor
-   action
-   resource
-   timestamp
-   metadata

------------------------------------------------------------------------

## analytics_events

Purpose:

Operational metrics.

Fields:

-   id
-   session_id
-   event_name
-   duration_ms
-   payload

------------------------------------------------------------------------

# Database Relationships

``` text
Organization
    │
    └── User
          │
          ├── API Key
          │
          └── Verification Session
                    │
                    ├── Request
                    ├── Claims
                    │      │
                    │      ├── Evidence
                    │      └── Signals
                    │
                    └── Receipt
```

------------------------------------------------------------------------

# Migration Strategy

Use Alembic.

Every migration should include:

-   Schema change
-   Rollback
-   Seed updates (if required)

------------------------------------------------------------------------

# Indexing

Recommended indexes:

-   user_id
-   organization_id
-   session_id
-   claim_id
-   created_at
-   receipt_id

Full-text indexes:

-   prompt
-   response_text
-   claim_text

------------------------------------------------------------------------

# Data Retention

Suggested policy:

-   Sessions: configurable
-   Receipts: long-term
-   Audit logs: immutable
-   Analytics: archival after retention period

------------------------------------------------------------------------

# Security

-   Encrypt secrets
-   Hash API keys
-   Parameterized queries
-   Row-level authorization
-   Audit trail
-   Backup policy

------------------------------------------------------------------------

# Repository Structure

``` text
backend/storage/postgres/
├── models/
├── repositories/
├── migrations/
├── seeds/
├── queries/
└── connection.py
```

------------------------------------------------------------------------

# Design Principles

1.  PostgreSQL stores transactional data only.
2.  Vector data remains in Qdrant.
3.  Cache remains in Redis.
4.  Every verification session is auditable.
5.  Database schema is versioned with migrations.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 15 defined the retrieval system.
-   **Chapter 16 defines the relational database design.**
-   Chapter 17 describes the vector database architecture and indexing
    strategy.
