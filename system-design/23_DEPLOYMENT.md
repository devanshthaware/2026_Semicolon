# 23_DEPLOYMENT.md

# Argus System Design

## Chapter 23 -- Deployment Architecture

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the deployment architecture for Argus,
including local development, staging, production, containerization,
orchestration, networking, scaling, configuration, and release strategy.

------------------------------------------------------------------------

# Deployment Goals

-   Repeatable deployments
-   Environment consistency
-   Horizontal scalability
-   Zero-downtime releases
-   Secure infrastructure
-   Operational resilience

------------------------------------------------------------------------

# Deployment Environments

  Environment   Purpose
  ------------- ---------------------------
  Local         Development
  CI            Build & Test
  Staging       Pre-production validation
  Production    Customer traffic

------------------------------------------------------------------------

# High-Level Topology

``` text
Internet
    │
    ▼
Load Balancer
    │
    ▼
API Gateway (FastAPI)
    │
    ▼
LangGraph Runtime
    │
 ┌──┼───────────────┐
 ▼  ▼               ▼
Model Service  Retrieval Service  Background Workers
 │                  │
 ▼                  ▼
PostgreSQL   Redis   Qdrant
```

------------------------------------------------------------------------

# Containerized Services

-   frontend
-   api-gateway
-   langgraph-runtime
-   model-service
-   retrieval-service
-   postgres
-   redis
-   qdrant
-   worker
-   telemetry

Each service is independently deployable.

------------------------------------------------------------------------

# Docker

Every service should include:

-   Dockerfile
-   Health check
-   Non-root user
-   Multi-stage build
-   Minimal runtime image

------------------------------------------------------------------------

# Docker Compose

Development stack:

``` text
docker-compose.yml
├── frontend
├── backend
├── postgres
├── redis
├── qdrant
└── langsmith (optional)
```

------------------------------------------------------------------------

# Kubernetes

Recommended workloads:

-   Deployment
-   StatefulSet
-   Service
-   Ingress
-   ConfigMap
-   Secret
-   HorizontalPodAutoscaler

------------------------------------------------------------------------

# Networking

Traffic flow:

``` text
Client
  │
HTTPS
  │
Ingress
  │
API Gateway
  │
Internal Services
```

Internal services communicate over a private network.

------------------------------------------------------------------------

# Configuration

Environment variables:

-   DATABASE_URL
-   REDIS_URL
-   QDRANT_URL
-   JWT_SECRET
-   API_KEY_SALT
-   MODEL_PATH
-   LANGSMITH_API_KEY

------------------------------------------------------------------------

# Scaling Strategy

Horizontally scalable:

-   API Gateway
-   LangGraph Runtime
-   Retrieval Service
-   Workers

Independently scalable:

-   Model Service
-   Qdrant
-   Redis

------------------------------------------------------------------------

# CI/CD Pipeline

``` text
Commit
  │
  ▼
Build
  │
  ▼
Unit Tests
  │
  ▼
Integration Tests
  │
  ▼
Container Build
  │
  ▼
Security Scan
  │
  ▼
Deploy Staging
  │
  ▼
Approval
  │
  ▼
Deploy Production
```

------------------------------------------------------------------------

# Release Strategy

-   Semantic versioning
-   Blue/Green or Rolling deployment
-   Rollback support
-   Database migrations before application rollout

------------------------------------------------------------------------

# Backup & Recovery

Back up:

-   PostgreSQL
-   Redis snapshots (optional)
-   Qdrant snapshots
-   Configuration
-   Model artifacts

Regular restore tests are recommended.

------------------------------------------------------------------------

# Monitoring

Monitor:

-   Pod health
-   CPU / Memory
-   Request latency
-   Queue depth
-   Database connections
-   Cache hit ratio
-   Model inference latency

------------------------------------------------------------------------

# Repository Layout

``` text
infra/
├── docker/
├── compose/
├── kubernetes/
├── helm/
├── scripts/
└── environments/
```

------------------------------------------------------------------------

# Design Principles

1.  Infrastructure as Code.
2.  Immutable container images.
3.  Independent service scaling.
4.  Automated deployments.
5.  Secure configuration management.
6.  Zero-downtime upgrades where possible.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 22 defined observability.
-   **Chapter 23 defines deployment architecture.**
-   Chapter 24 describes scalability and capacity planning.
