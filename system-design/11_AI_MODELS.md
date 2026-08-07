# 11_AI_MODELS.md

# TruthLayer System Design

## Chapter 11 -- AI Models

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter documents every trainable AI model used by TruthLayer,
their responsibilities, datasets, inputs, outputs, training strategy,
inference pipeline, deployment, and lifecycle.

------------------------------------------------------------------------

# AI Model Portfolio

  -----------------------------------------------------------------------
  Model           Primary Purpose                   Framework
  --------------- --------------------------------- ---------------------
  Semantic        Estimate hallucination            PyTorch
  Entropy Probe   probability                       
  (SEP)                                             

  Fusion Trust    Compute overall trust score       LightGBM
  Model                                             

  Claim Type      Categorize claims                 Transformers /
  Classifier                                        scikit-learn

  Claim           Extract atomic claims             Seq2Seq /
  Extraction                                        Prompt-based
  Model                                             

  Claim           Build claim graph                 Graph-based / GNN
  Dependency                                        
  Model                                             

  Cross-Model     Measure response agreement        Embeddings + NLI
  Agreement                                         

  Trust           Calibrate trust score             Isotonic + Conformal
  Calibration                                       
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Model Lifecycle

``` text
Dataset
   │
   ▼
Preprocessing
   │
   ▼
Training
   │
   ▼
Evaluation
   │
   ▼
Model Registry
   │
   ▼
Deployment
   │
   ▼
Inference
   │
   ▼
Monitoring
```

------------------------------------------------------------------------

# 1. Semantic Entropy Probe (SEP)

## Purpose

Predict hallucination risk from hidden-state features without requiring
multiple response generations.

## Dataset

-   SEP_Dataset

## Inputs

-   Hidden-state statistics
-   Token entropy features
-   Attention-derived features (optional)

## Outputs

-   Semantic entropy score
-   Hallucination probability

## Training

-   PyTorch
-   Binary classification
-   Early stopping
-   Model checkpointing

## Metrics

-   Accuracy
-   ROC-AUC
-   Precision
-   Recall
-   F1 Score

## Inference Consumer

Semantic Analysis Agent

------------------------------------------------------------------------

# 2. Fusion Trust Model

## Purpose

Fuse all verification signals into a single trust score.

## Dataset

-   Fusion_Trust_Model_Datasets

## Inputs

-   SEP score
-   Retrieval confidence
-   NLI confidence
-   Symbolic verification
-   Temporal validation
-   Agreement score

## Outputs

-   Trust score
-   Risk level
-   Verification decision

## Framework

-   LightGBM

## Metrics

-   RMSE
-   MAE
-   Calibration Error

## Inference Consumer

Fusion Trust Agent

------------------------------------------------------------------------

# 3. Claim Type Classifier

## Purpose

Classify claims into verification categories.

## Labels

-   FACTUAL
-   NUMERIC
-   TEMPORAL
-   LOGICAL
-   OPINION

## Dataset

-   Claim_Type_Classifier

## Output

Claim type label

## Consumer

Claim Type Agent

------------------------------------------------------------------------

# 4. Claim Extraction Model

## Purpose

Convert generated responses into atomic claims.

## Dataset

-   Claim_Extraction

## Input

LLM response

## Output

Ordered list of claims

## Current Strategy

Prompt-based extraction

## Future Strategy

Fine-tuned encoder-decoder model

------------------------------------------------------------------------

# 5. Claim Dependency Model

## Purpose

Model relationships between claims.

## Dataset

-   Claim_Dependency

## Output

Directed dependency graph

## Current

Rule-based graph construction

## Future

Graph Neural Network

------------------------------------------------------------------------

# 6. Cross-Model Agreement

## Purpose

Estimate semantic agreement across multiple LLM outputs.

## Dataset

-   Cross_Model_Agreement

## Inputs

Responses from: - Qwen - Llama - Gemma - Mistral

## Output

Agreement score

## Techniques

-   Embeddings
-   Cosine similarity
-   DeBERTa NLI

------------------------------------------------------------------------

# 7. Trust Calibration

## Purpose

Transform raw trust scores into calibrated confidence estimates.

## Dataset

-   Trust_Calibration\_(Conformal)

## Methods

-   Isotonic Regression
-   Conformal Prediction

## Outputs

-   Calibrated score
-   Confidence interval

------------------------------------------------------------------------

# Dataset Mapping

  Dataset                          Model
  -------------------------------- ------------------------
  SEP_Dataset                      Semantic Entropy Probe
  Fusion_Trust_Model_Datasets      Fusion Trust Model
  Claim_Type_Classifier            Claim Type Classifier
  Claim_Extraction                 Claim Extraction Model
  Claim_Dependency                 Claim Dependency Model
  Cross_Model_Agreement            Cross-Model Agreement
  Trust_Calibration\_(Conformal)   Trust Calibration

------------------------------------------------------------------------

# Model Registry

Every production model should track:

-   Name
-   Version
-   Training dataset version
-   Metrics
-   Training date
-   Checkpoint path
-   Framework
-   Deployment status

------------------------------------------------------------------------

# Deployment

Models are hosted behind the Model Service.

Capabilities: - Lazy loading - Health checks - Version rollback -
GPU/CPU execution - Batch inference

------------------------------------------------------------------------

# Monitoring

Track: - Inference latency - Throughput - Error rate - Drift
indicators - Calibration quality - Model version usage

------------------------------------------------------------------------

# Design Principles

1.  One responsibility per model.
2.  Models communicate through structured outputs.
3.  Training datasets are versioned.
4.  Inference is isolated behind the Model Service.
5.  Model replacement must not require workflow changes.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 10 defined the verification pipeline.
-   **Chapter 11 defines all trainable AI models.**
-   Chapter 12 describes dataset architecture and data preparation.
