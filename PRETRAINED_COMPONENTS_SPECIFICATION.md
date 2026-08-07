# PRETRAINED_COMPONENTS_SPECIFICATION.md

# Argus Pretrained Components Specification

**Version:** 1.0

## Purpose

This document is the source of truth for all third-party pretrained
models and algorithmic engines used by Argus. It defines why each
component exists, where it is used, its inputs, outputs, and replacement
strategy.

------------------------------------------------------------------------

# Overall Pipeline

``` text
User Prompt
    │
    ▼
Base LLM
    │
    ▼
Claim Extraction
    │
    ▼
Claim Type Routing
    │
    ├───────────────┬────────────────────────────┐
    ▼               ▼                            ▼
Retrieval       Hidden States              Cross Models
(BM25+BGE)           │                          │
    │                ▼                          ▼
    │         Semantic Entropy Probe    Agreement Scorer
    ▼                │                          │
BGE Reranker         ▼                          │
    ▼          DeBERTa NLI                     │
Evidence             │                          │
    └────────────────┴──────────────┬──────────┘
                                    ▼
                           Fusion Trust Model
                                    ▼
                          Trust Calibration
                                    ▼
                         Verification Receipt
```

------------------------------------------------------------------------

# P001 -- Base LLM

## Supported Models

-   Qwen
-   Llama
-   Gemma
-   Mistral

## Purpose

Generate the initial response and expose hidden states for downstream
verification.

## Inputs

-   User prompt
-   Conversation history
-   System prompt

## Outputs

-   Generated response
-   Token probabilities
-   Hidden states
-   Attention tensors (optional)

## Used By

-   Claim Extraction
-   Semantic Entropy Probe
-   Cross-Model Agreement

## Replaceable

Yes. Any Hugging Face-compatible model can be substituted.

------------------------------------------------------------------------

# P002 -- DeBERTa-v3-MNLI

## Purpose

Natural Language Inference (NLI).

## Inputs

-   Claim
-   Evidence

## Outputs

-   Entailment
-   Neutral
-   Contradiction
-   Confidence score

## Used In

Retrieval verification layer.

Decision Rules - Entailment → supports claim - Neutral → insufficient
evidence - Contradiction → hallucination signal

------------------------------------------------------------------------

# P003 -- BGE / E5 Embeddings

## Purpose

Convert text into dense vectors.

## Inputs

-   Claim
-   Evidence
-   Documents
-   Queries

## Outputs

Dense embedding vectors.

## Used In

-   Dense retrieval
-   Semantic search
-   Similarity scoring
-   Cross-model agreement

------------------------------------------------------------------------

# P004 -- BM25

## Purpose

Sparse keyword retrieval.

## Inputs

-   User query
-   Claim

## Outputs

Top-K candidate documents.

## Used In

Hybrid retrieval before reranking.

------------------------------------------------------------------------

# P005 -- BGE Reranker

## Purpose

Re-rank retrieved evidence by semantic relevance.

## Inputs

-   Query/Claim
-   Candidate documents

## Outputs

Ordered evidence list with relevance scores.

## Used In

Hybrid Retrieval → NLI pipeline.

------------------------------------------------------------------------

# P006 -- Z3 Solver

## Purpose

Formal symbolic reasoning.

## Inputs

-   Logical expressions
-   Constraints

## Outputs

-   SAT / UNSAT
-   Counterexample (if available)

## Used In

Logical claim verification.

Examples - Transitive reasoning - Rule consistency - Constraint
validation

------------------------------------------------------------------------

# P007 -- Python Arithmetic Engine

## Purpose

Verify arithmetic and numeric claims deterministically.

## Inputs

-   Mathematical expressions
-   Numeric claims

## Outputs

-   Computed value
-   Pass / Fail

## Used In

Numeric verification layer.

Examples - Percentages - Unit conversions - Basic arithmetic -
Statistical calculations

------------------------------------------------------------------------

# Integration Matrix

  Component       Input              Output                     Consumer
  --------------- ------------------ -------------------------- -----------------------
  Base LLM        Prompt             Response + Hidden States   SEP, Claim Extraction
  BGE/E5          Text               Embeddings                 Retrieval, Agreement
  BM25            Query              Candidate Docs             Reranker
  BGE Reranker    Docs               Ranked Docs                DeBERTa
  DeBERTa         Claim + Evidence   NLI Score                  Fusion Model
  Z3 Solver       Logic              Validity                   Fusion Model
  Python Engine   Numeric Claim      Numeric Result             Fusion Model

------------------------------------------------------------------------

# Design Principles

1.  All pretrained components are stateless.
2.  Components may be upgraded independently.
3.  The Fusion Trust Model is the only component allowed to produce the
    final trust score.
4.  All pretrained outputs must be normalized before entering the Fusion
    Trust Model.
5.  Every component must expose structured outputs for debugging and
    visualization.

------------------------------------------------------------------------

# Future Upgrades

-   Replace Base LLM without changing downstream interfaces.
-   Swap embedding models (BGE ↔ E5).
-   Upgrade NLI model as better checkpoints become available.
-   Add multilingual embedding and NLI models.
-   Introduce domain-specific retrieval indexes.
