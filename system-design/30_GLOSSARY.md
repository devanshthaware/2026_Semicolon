# 30_GLOSSARY.md

# TruthLayer System Design

## Chapter 30 -- Glossary

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This glossary defines the terminology used throughout the TruthLayer
System Design documentation. It provides consistent definitions for
architectural concepts, AI models, workflows, infrastructure, datasets,
and operational terms.

------------------------------------------------------------------------

# A

## Agent

An independent verification component responsible for one task in the
LangGraph workflow.

## API Gateway

The FastAPI service that authenticates requests, validates input, and
starts verification workflows.

## Atomic Claim

A single verifiable statement extracted from an LLM response.

## Audit Log

An immutable record of security, administrative, or verification events.

------------------------------------------------------------------------

# B

## BGE

Beijing Academy of Artificial Intelligence General Embedding model used
for dense retrieval.

## BGE Reranker

A cross-encoder model used to rerank retrieval candidates before NLI
verification.

## BM25

A sparse lexical retrieval algorithm used alongside dense retrieval.

------------------------------------------------------------------------

# C

## Calibration

The process of transforming raw trust scores into calibrated confidence
estimates.

## Claim Dependency Model

A model that identifies relationships between extracted claims.

## Claim Extraction

The process of converting a generated response into atomic claims.

## Claim Type Classifier

A classifier that labels claims as FACTUAL, NUMERIC, TEMPORAL, LOGICAL,
or OPINION.

## Conformal Prediction

A statistical framework used to estimate confidence intervals with
coverage guarantees.

------------------------------------------------------------------------

# D

## DeBERTa-v3-MNLI

A pretrained Natural Language Inference model used to classify evidence
as entailment, contradiction, or neutral.

## Dense Retrieval

Semantic retrieval using vector embeddings.

------------------------------------------------------------------------

# E

## Embedding

A numerical vector representation of text.

## Evidence

Retrieved passages used to verify an atomic claim.

------------------------------------------------------------------------

# F

## FastAPI

The Python web framework used for TruthLayer's API Gateway.

## Fusion Trust Model

A LightGBM model that combines verification signals into a final trust
score.

------------------------------------------------------------------------

# G

## Graph Node

A single execution step within a LangGraph workflow.

------------------------------------------------------------------------

# H

## Hallucination

A generated statement that is unsupported, incorrect, fabricated, or
unverifiable.

## HNSW

A graph-based approximate nearest-neighbor indexing algorithm used by
vector databases.

------------------------------------------------------------------------

# L

## LangChain

A framework providing prompt templates, tool abstractions, retrievers,
and runnable components.

## LangGraph

The workflow orchestration framework that manages VerificationState and
verification agents.

## LangSmith

The observability platform used for tracing workflows, prompts, and
agent execution.

------------------------------------------------------------------------

# N

## Natural Language Inference (NLI)

The task of determining whether evidence entails, contradicts, or is
neutral toward a claim.

------------------------------------------------------------------------

# P

## PostgreSQL

Primary relational database for transactional data.

## Prompt

The user input submitted for verification.

------------------------------------------------------------------------

# Q

## Qdrant

The vector database used for semantic document retrieval.

------------------------------------------------------------------------

# R

## Receipt

A structured verification artifact containing trust score, evidence,
signals, and metadata.

## Redis

The in-memory cache used for sessions, checkpoints, events, and rate
limiting.

## Retrieval

The process of finding evidence relevant to a claim.

------------------------------------------------------------------------

# S

## Semantic Entropy

A measure of uncertainty derived from model outputs.

## Semantic Entropy Probe (SEP)

A custom model that predicts hallucination probability from hidden-state
features.

## SSE

Server-Sent Events used to stream verification progress to clients.

------------------------------------------------------------------------

# T

## Temporal Validation

Verification of claims involving dates, versions, or time-sensitive
information.

## Trust Calibration

The process of adjusting raw trust scores into calibrated confidence
estimates.

## Trust Score

The overall confidence value produced after fusing verification signals.

------------------------------------------------------------------------

# V

## Vector Database

A database optimized for storing and searching embedding vectors.

## Verification Pipeline

The end-to-end workflow from prompt ingestion to receipt generation.

## Verification Receipt

The final structured output documenting how a response was verified.

## Verification Signals

Intermediate outputs from semantic, retrieval, NLI, symbolic, temporal,
and agreement verification.

## VerificationState

The shared state object passed between LangGraph nodes.

------------------------------------------------------------------------

# W

## WebSocket

A bidirectional communication protocol used for real-time verification
updates.

## Workflow

The ordered execution of verification agents coordinated by LangGraph.

------------------------------------------------------------------------

# Acronyms

  Acronym   Meaning
  --------- ------------------------------------------------
  API       Application Programming Interface
  CI/CD     Continuous Integration / Continuous Deployment
  GPU       Graphics Processing Unit
  HNSW      Hierarchical Navigable Small World
  JWT       JSON Web Token
  LLM       Large Language Model
  MAE       Mean Absolute Error
  MRR       Mean Reciprocal Rank
  NLI       Natural Language Inference
  RPO       Recovery Point Objective
  RTO       Recovery Time Objective
  SDK       Software Development Kit
  SEP       Semantic Entropy Probe
  SLA       Service Level Agreement
  SSE       Server-Sent Events
  TTL       Time To Live

------------------------------------------------------------------------

# Glossary Maintenance

Guidelines:

1.  Add new terms whenever architecture evolves.
2.  Keep definitions concise and consistent.
3.  Reference terminology used throughout the documentation.
4.  Update acronyms when introducing new technologies.
5.  Review glossary as part of documentation releases.

------------------------------------------------------------------------

# Relationship to Documentation

-   Chapters 1--29 define the TruthLayer architecture, implementation,
    operations, and research.
-   **Chapter 30 provides the canonical glossary and terminology
    reference.**

This glossary concludes the TruthLayer System Design documentation.
