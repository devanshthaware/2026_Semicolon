# 19_API_DESIGN.md

# TruthLayer System Design

## Chapter 19 -- API Design

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the external API exposed by TruthLayer. It
specifies REST endpoints, streaming interfaces, authentication,
request/response contracts, versioning, SDK compatibility, and error
handling.

------------------------------------------------------------------------

# Design Goals

-   API-first architecture
-   Stable versioning
-   Streaming support
-   Language-agnostic SDKs
-   Secure authentication
-   Consistent schemas
-   Backward compatibility

------------------------------------------------------------------------

# High-Level API Architecture

``` text
Client
  │
  ├── REST
  ├── WebSocket
  └── SSE
        │
        ▼
 FastAPI API Gateway
        │
        ▼
 Authentication
        │
        ▼
 LangGraph Workflow
        │
        ▼
 Verification Services
```

------------------------------------------------------------------------

# API Versioning

Base URL:

``` text
/api/v1
```

Future versions:

-   /api/v2
-   /api/v3

Versioning policy:

-   No breaking changes within a major version.
-   Deprecation notices before removal.

------------------------------------------------------------------------

# Authentication

Supported methods:

-   API Key
-   JWT Bearer Token

Headers:

``` http
Authorization: Bearer <token>
X-API-Key: <api_key>
```

------------------------------------------------------------------------

# REST Endpoints

## Health

``` http
GET /api/v1/health
```

Returns service status.

------------------------------------------------------------------------

## Verify Prompt

``` http
POST /api/v1/verify
```

Request:

``` json
{
  "prompt": "...",
  "model": "qwen",
  "stream": true
}
```

Response:

``` json
{
  "session_id": "...",
  "trust_score": 0.93,
  "risk_level": "LOW"
}
```

------------------------------------------------------------------------

## Verification Status

``` http
GET /api/v1/sessions/{session_id}
```

Returns current workflow status.

------------------------------------------------------------------------

## Receipt

``` http
GET /api/v1/receipts/{receipt_id}
```

Returns the verification receipt.

------------------------------------------------------------------------

## Analytics

``` http
GET /api/v1/analytics
```

Returns usage and performance metrics.

------------------------------------------------------------------------

## API Keys

``` http
GET  /api/v1/apikeys
POST /api/v1/apikeys
DELETE /api/v1/apikeys/{id}
```

------------------------------------------------------------------------

# Streaming APIs

## WebSocket

``` text
ws://host/api/v1/ws/{session_id}
```

Events:

-   session.started
-   response.generated
-   claims.extracted
-   verification.progress
-   trust.updated
-   receipt.created
-   session.completed

------------------------------------------------------------------------

## Server-Sent Events

``` http
GET /api/v1/stream/{session_id}
```

Streams:

-   Tokens
-   Verification updates
-   Trust score changes
-   Receipt availability

------------------------------------------------------------------------

# Common Schemas

## VerificationRequest

``` json
{
  "prompt": "string",
  "model": "string",
  "stream": true
}
```

## VerificationResponse

``` json
{
  "session_id": "string",
  "trust_score": 0.0,
  "risk_level": "LOW",
  "receipt_id": "string"
}
```

## ErrorResponse

``` json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": {}
}
```

------------------------------------------------------------------------

# Status Codes

  Code   Meaning
  ------ ------------------
  200    Success
  201    Created
  400    Bad Request
  401    Unauthorized
  403    Forbidden
  404    Not Found
  409    Conflict
  422    Validation Error
  429    Rate Limited
  500    Internal Error

------------------------------------------------------------------------

# Rate Limiting

Policies:

-   Per API key
-   Per user
-   Per organization

Redis-backed counters enforce limits.

------------------------------------------------------------------------

# SDK Compatibility

Supported SDKs:

-   Python
-   JavaScript / TypeScript
-   Go
-   Java
-   C#
-   REST (raw HTTP)

All SDKs wrap the same API contracts.

------------------------------------------------------------------------

# OpenAPI

FastAPI automatically generates:

``` text
/openapi.json
/docs
/redoc
```

------------------------------------------------------------------------

# Security

-   HTTPS only
-   JWT validation
-   API key hashing
-   Input validation (Pydantic)
-   CORS configuration
-   Audit logging

------------------------------------------------------------------------

# Repository Structure

``` text
backend/api/
├── routers/
├── schemas/
├── dependencies/
├── middleware/
├── auth/
├── websocket/
└── main.py
```

------------------------------------------------------------------------

# Design Principles

1.  REST for resource operations.
2.  WebSockets/SSE for live verification.
3.  Stable schemas.
4.  Version every public API.
5.  SDKs are generated from OpenAPI where possible.
6.  Errors are structured and machine-readable.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 18 defined cache architecture.
-   **Chapter 19 defines the external API.**
-   Chapter 20 describes the SDK architecture and developer
    integrations.
