# 24_SCALABILITY.md

# Argus System Design

## Chapter 24 -- Scalability Architecture

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines how Argus scales from a single-node
development environment to a multi-region production platform. It covers
horizontal scaling, distributed execution, database scaling, vector
search, model serving, autoscaling, capacity planning, and performance
optimization.

------------------------------------------------------------------------

# Scalability Objectives

-   Horizontal scalability
-   Stateless application services
-   Independent service scaling
-   High availability
-   Low latency
-   Elastic capacity
-   Fault isolation

------------------------------------------------------------------------

# High-Level Scalability Architecture

``` text
                    Internet
                        │
                Global Load Balancer
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
    Region A                     Region B
          │                           │
      API Gateway                 API Gateway
          │                           │
      LangGraph                  LangGraph
          │                           │
   ┌──────┼──────────┐         ┌──────┼──────────┐
   ▼      ▼          ▼         ▼      ▼          ▼
Models Retrieval Workers    Models Retrieval Workers
   │      │          │         │      │          │
 PostgreSQL  Redis  Qdrant (regional services)
```

------------------------------------------------------------------------

# Scaling Principles

1.  Scale services independently.
2.  Keep compute services stateless.
3.  Externalize state.
4.  Prefer asynchronous execution where possible.
5.  Scale read-heavy systems separately from write-heavy systems.

------------------------------------------------------------------------

# Service Scaling Matrix

  Service              Scale Strategy
  -------------------- -------------------------
  Frontend             Horizontal
  API Gateway          Horizontal
  LangGraph Runtime    Horizontal
  Retrieval Service    Horizontal
  Model Service        Independent GPU pools
  Background Workers   Queue-based horizontal
  PostgreSQL           Primary + Read Replicas
  Redis                Cluster / Sentinel
  Qdrant               Distributed collections

------------------------------------------------------------------------

# API Scaling

Strategies:

-   Stateless FastAPI instances
-   Load balancer
-   Connection pooling
-   Request timeouts
-   Rate limiting

------------------------------------------------------------------------

# LangGraph Scaling

Each workflow executes independently.

Recommendations:

-   Multiple runtime replicas
-   Shared Redis checkpoints
-   External PostgreSQL state
-   Queue-based execution for long-running jobs

------------------------------------------------------------------------

# Model Serving

Deploy model services independently.

Recommended pools:

-   SEP Service
-   Fusion Trust Service
-   Classification Service
-   Embedding Service

Benefits:

-   GPU isolation
-   Independent upgrades
-   Autoscaling

------------------------------------------------------------------------

# Retrieval Scaling

Pipeline:

``` text
Claim
   │
   ├── BM25 Cluster
   └── Vector Cluster
            │
            ▼
       BGE Reranker
```

Scale BM25 and vector search independently.

------------------------------------------------------------------------

# Database Scaling

## PostgreSQL

-   Primary instance
-   Read replicas
-   Connection pooling
-   Automated backups

## Redis

-   Cluster mode
-   Sentinel
-   Replication

## Qdrant

-   Distributed collections
-   Sharding
-   Replication

------------------------------------------------------------------------

# Queue-Based Processing

Suitable for:

-   Batch indexing
-   Embedding generation
-   Analytics
-   Background maintenance
-   Model retraining

------------------------------------------------------------------------

# Autoscaling

Kubernetes HPA targets:

-   CPU
-   Memory
-   Request rate
-   Queue depth
-   GPU utilization (custom metrics)

------------------------------------------------------------------------

# Capacity Planning

Monitor:

-   Requests/sec
-   Active sessions
-   Concurrent workflows
-   Retrieval latency
-   Model latency
-   Database utilization
-   Cache hit ratio

Review capacity regularly before saturation.

------------------------------------------------------------------------

# Performance Optimization

-   Parallel verification
-   Warm model loading
-   Cached retrieval
-   Connection pooling
-   Batch inference
-   Lazy initialization
-   Streaming responses

------------------------------------------------------------------------

# High Availability

-   Multiple replicas
-   Health probes
-   Automatic restart
-   Rolling deployments
-   Regional redundancy
-   Backup and recovery

------------------------------------------------------------------------

# Failure Isolation

If one subsystem fails:

-   Retrieval → continue with reduced confidence
-   Optional verification agent → continue with warning
-   Model service → fallback if configured
-   Cache → bypass to primary storage

------------------------------------------------------------------------

# Repository Structure

``` text
infra/
├── scaling/
├── autoscaling/
├── load-balancing/
├── capacity/
└── performance/
```

------------------------------------------------------------------------

# Design Principles

1.  Stateless compute.
2.  Shared persistent storage.
3.  Independent scaling domains.
4.  Graceful degradation.
5.  Performance measured continuously.
6.  Capacity planned proactively.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 23 defined deployment architecture.
-   **Chapter 24 defines scalability and capacity planning.**
-   Chapter 25 describes CI/CD architecture and release automation.
