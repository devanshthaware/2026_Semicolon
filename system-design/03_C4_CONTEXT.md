# 03_C4_CONTEXT.md

# Argus System Design

## Chapter 3 -- C4 Context Diagram

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the **Level 1 (Context)** view of the Argus
architecture using the C4 model. It identifies the people, external
systems, and major relationships surrounding the platform.

------------------------------------------------------------------------

# System Scope

Argus is an independent AI verification platform that integrates
with Large Language Models (LLMs) to verify responses before they are
presented to users or applications.

Argus does **not** replace an LLM. It augments LLMs with
verification, evidence retrieval, trust scoring, and explainable
receipts.

------------------------------------------------------------------------

# Primary Actors

## End User

Uses AI-powered applications backed by Argus.

Responsibilities:

-   Submit prompts
-   View verified responses
-   Inspect trust scores
-   Review evidence and receipts

------------------------------------------------------------------------

## Developer

Integrates Argus into products using the SDK or REST API.

Responsibilities:

-   Obtain API keys
-   Configure models
-   Consume verification results
-   Monitor usage

------------------------------------------------------------------------

## Administrator

Operates the platform.

Responsibilities:

-   Manage users
-   Configure models
-   Monitor health
-   Review analytics
-   Manage deployments

------------------------------------------------------------------------

# External Systems

## Large Language Models

Supported examples:

-   Qwen
-   Llama
-   Gemma
-   Mistral

Role:

Generate candidate responses and hidden-state outputs for verification.

------------------------------------------------------------------------

## Knowledge Sources

Provide factual grounding.

Examples:

-   Internal document collections
-   Vector indexes
-   Search indexes

------------------------------------------------------------------------

## Observability Platform

LangSmith records:

-   Workflow traces
-   Prompt execution
-   Agent latency
-   Model outputs
-   Errors

------------------------------------------------------------------------

# System Context Diagram

``` text
                         ┌────────────────────┐
                         │      End User      │
                         └─────────┬──────────┘
                                   │
                                   ▼
                    ┌────────────────────────────┐
                    │      Argus Platform   │
                    │                            │
                    │  • API Gateway             │
                    │  • LangGraph Workflow      │
                    │  • Verification Agents     │
                    │  • AI Models              │
                    │  • Receipt Engine         │
                    └──────┬───────────┬────────┘
                           │           │
             ┌─────────────┘           └──────────────┐
             ▼                                        ▼
    Large Language Models                    Knowledge Sources
 (Qwen/Llama/Gemma/Mistral)            (BM25 / Qdrant / Documents)

                           │
                           ▼
                     LangSmith
               (Tracing & Observability)
```

------------------------------------------------------------------------

# Primary Relationships

  -----------------------------------------------------------------------
  Source                 Target                 Purpose
  ---------------------- ---------------------- -------------------------
  End User               Argus             Submit prompts and
                                                receive verified
                                                responses

  Developer              Argus             API and SDK integration

  Argus             LLM                    Generate candidate
                                                responses

  Argus             Knowledge Sources      Retrieve supporting
                                                evidence

  Argus             LangSmith              Trace execution and
                                                diagnostics

  Administrator          Argus             Operate and configure
                                                platform
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Responsibilities of Argus

Argus is responsible for:

-   Orchestrating verification workflows
-   Extracting claims
-   Retrieving evidence
-   Measuring uncertainty
-   Performing logical and temporal verification
-   Computing trust scores
-   Calibrating confidence
-   Generating verification receipts
-   Exposing APIs and SDKs

------------------------------------------------------------------------

# Out of Scope

The following are external to the platform:

-   Training foundation LLMs
-   Owning external knowledge sources
-   Replacing application business logic
-   User interface implementations beyond the provided website,
    dashboard, and SDK examples

------------------------------------------------------------------------

# Design Principles

1.  Argus is a verification layer, not a language model.
2.  External systems remain loosely coupled.
3.  Verification is independent of generation.
4.  Every external dependency is replaceable.
5.  Trust decisions are produced only after verification completes.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 01 introduces the platform vision.
-   Chapter 02 explains the system overview.
-   **Chapter 03 defines the external context.**
-   Chapter 04 will decompose the platform into containers.
