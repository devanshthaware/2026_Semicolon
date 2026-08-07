# AI_MODELS_SPECIFICATION.md

# Argus AI Models Specification (Source of Truth)

Version: 1.0

## Purpose

This document is the authoritative specification for all AI/ML models
used by Argus. It defines responsibilities, interfaces, datasets,
training requirements, inputs, outputs, and roadmap.

## Model Registry

  ID     Component                      Type                   Custom     Training
  ------ ------------------------------ ---------------------- ---------- -------------
  M001   Semantic Entropy Probe         MLP                    Yes        Required
  M002   Fusion Trust Model             LightGBM               Yes        Required
  M003   Claim Type Classifier          Classifier             Optional   Optional
  M004   Claim Extraction               Prompt / Seq2Seq       Optional   Optional
  M005   Claim Dependency Engine        Graph                  No         No
  M006   Cross-Model Agreement Scorer   Algorithm              No         No
  M007   Trust Calibration              Conformal Prediction   No         Calibration

------------------------------------------------------------------------

## M001 -- Semantic Entropy Probe

### Purpose

Estimate hallucination probability from hidden-state features.

### Inputs

-   hidden_mean
-   hidden_std
-   hidden_norm
-   final_token_entropy
-   max_logit
-   logit_margin
-   attention_dispersion
-   retrieval_confidence
-   semantic_consistency

### Output

-   semantic_entropy_score (0--1)

### Dataset

Hidden-state features + semantic entropy labels.

### Training

-   Model: MLP
-   Loss: MSE
-   Optimizer: AdamW

### Consumer

Fusion Trust Model

------------------------------------------------------------------------

## M002 -- Fusion Trust Model

### Purpose

Fuse verification signals into one trust score.

### Inputs

-   SEP
-   Semantic Entropy
-   Kernel Entropy
-   NLI
-   Retrieval
-   Symbolic
-   Temporal
-   Cross-Model Agreement
-   Critic

### Output

-   Trust Score
-   Risk Level
-   Verification Decision

### Dataset

Verification signals + trust labels.

### Training

-   Model: LightGBM
-   Objective: Regression

### Consumer

Dashboard, Live Demo, Receipt Generator

------------------------------------------------------------------------

## M003 -- Claim Type Classifier

Purpose: Route claims to the correct verification pipeline.

Classes: - FACTUAL - NUMERIC - TEMPORAL - LOGICAL - OPINION

Current: Prompt-based

Future: Fine-tuned Transformer

------------------------------------------------------------------------

## M004 -- Claim Extraction

Purpose: Split responses into atomic claims.

Current: Prompt-based

Future: Fine-tuned seq2seq model.

------------------------------------------------------------------------

## M005 -- Claim Dependency Engine

Purpose: Build claim dependency graphs.

Current: - Graph heuristics - Embedding similarity

Future: - Graph Neural Network

------------------------------------------------------------------------

## M006 -- Cross-Model Agreement Scorer

Purpose: Measure semantic agreement across multiple LLM outputs.

Implementation: - Embeddings - Cosine similarity - NLI

Training: Not required.

------------------------------------------------------------------------

## M007 -- Trust Calibration

Purpose: Calibrate trust scores.

Method: Adaptive Conformal Prediction.

Training: Calibration only.

------------------------------------------------------------------------

## Model Interaction

User Prompt → LLM → Claim Extraction → Claim Type → Verification Signals
→ Fusion Trust Model → Trust Calibration → Verification Receipt

------------------------------------------------------------------------

## Roadmap

### Phase 1

-   Train SEP
-   Train Fusion Trust Model

### Phase 2

-   Claim Type Classifier

### Phase 3

-   Claim Extraction

### Phase 4

-   Graph-based dependency model
