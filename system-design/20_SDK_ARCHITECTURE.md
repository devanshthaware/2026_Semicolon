# 20_SDK_ARCHITECTURE.md

# Argus System Design

## Chapter 20 -- SDK Architecture

**Version:** 1.0 **Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the architecture of the official Argus SDKs.
The SDKs provide a consistent, language-native interface for developers
to integrate Argus verification services without interacting
directly with the REST or streaming APIs.

------------------------------------------------------------------------

# Objectives

-   Consistent developer experience
-   Language-agnostic API design
-   Strong typing where supported
-   Built-in authentication
-   Streaming support
-   Automatic retries
-   Backward compatibility

------------------------------------------------------------------------

# Supported SDKs

  Language                  Status
  ------------------------- -----------
  Python                    Official
  TypeScript / JavaScript   Official
  Go                        Planned
  Java                      Planned
  C#                        Planned
  Raw HTTP                  Supported

------------------------------------------------------------------------

# SDK Architecture

``` text
Application
      │
      ▼
 Argus SDK
      │
 ┌────┼───────────────┐
 ▼    ▼               ▼
Auth Client      REST Client
                  │
                  ▼
            Streaming Client
                  │
                  ▼
          Response Parser
                  │
                  ▼
          Typed Models
                  │
                  ▼
          FastAPI Gateway
```

------------------------------------------------------------------------

# Core SDK Components

## Client

Primary entry point.

Responsibilities:

-   Initialize SDK
-   Configure API endpoint
-   Authenticate requests
-   Expose high-level APIs

Example:

``` python
client = ArgusClient(
    api_key="...",
    base_url="https://api.argus.ai"
)
```

------------------------------------------------------------------------

## Authentication

Supported methods:

-   API Key
-   JWT

The SDK automatically attaches authentication headers.

------------------------------------------------------------------------

## REST Client

Responsibilities:

-   Build requests
-   Parse responses
-   Retry transient failures
-   Handle serialization
-   Apply timeouts

------------------------------------------------------------------------

## Streaming Client

Supports:

-   WebSockets
-   Server-Sent Events

Streams:

-   Tokens
-   Agent progress
-   Trust score updates
-   Final receipt

------------------------------------------------------------------------

## Response Models

Typed objects:

``` text
VerificationResponse
Receipt
Evidence
TrustScore
Analytics
Session
```

------------------------------------------------------------------------

## Error Handling

Standard exceptions:

-   AuthenticationError
-   ValidationError
-   RateLimitError
-   TimeoutError
-   APIError
-   VerificationError

------------------------------------------------------------------------

# SDK Modules

``` text
sdk/
├── auth/
├── client/
├── http/
├── websocket/
├── streaming/
├── models/
├── exceptions/
├── utils/
└── version.py
```

------------------------------------------------------------------------

# High-Level SDK Flow

``` text
Developer
    │
    ▼
SDK Client
    │
    ▼
Authentication
    │
    ▼
REST / Streaming
    │
    ▼
FastAPI
    │
    ▼
LangGraph
    │
    ▼
Verification Result
    │
    ▼
Typed Response
```

------------------------------------------------------------------------

# Public SDK Methods

Suggested methods:

-   verify()
-   verify_stream()
-   get_session()
-   get_receipt()
-   list_receipts()
-   list_api_keys()
-   health()
-   analytics()

------------------------------------------------------------------------

# Configuration

Options:

-   base_url
-   api_key
-   timeout
-   retries
-   user_agent
-   log_level

------------------------------------------------------------------------

# Retry Strategy

Retry on:

-   HTTP 429
-   HTTP 502
-   HTTP 503
-   Network failures

Exponential backoff with jitter is recommended.

------------------------------------------------------------------------

# Logging

Optional logging levels:

-   ERROR
-   WARN
-   INFO
-   DEBUG

Sensitive values must never be logged.

------------------------------------------------------------------------

# Versioning

SDK major versions align with API major versions.

Example:

API v1 ↔ SDK v1.x

------------------------------------------------------------------------

# Testing

Recommended coverage:

-   Unit tests
-   Integration tests
-   Mock server tests
-   Streaming tests
-   Authentication tests

------------------------------------------------------------------------

# Repository Layout

``` text
sdk/
├── python/
├── javascript/
├── shared/
├── examples/
├── docs/
└── tests/
```

------------------------------------------------------------------------

# Design Principles

1.  Thin client over public APIs.
2.  Consistent interfaces across languages.
3.  Typed request and response models.
4.  Built-in authentication and retries.
5.  Streaming as a first-class capability.
6.  SDKs remain backward compatible within a major version.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 19 defined the external API.
-   **Chapter 20 defines the SDK architecture and developer integration
    layer.**
-   Chapter 21 describes the security architecture for the Argus
    platform.
