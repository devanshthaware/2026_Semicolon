# 13_MODEL_TRAINING.md

# Argus System Design

## Chapter 13 -- Model Training

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the end-to-end training pipeline for all custom AI
models used by Argus. It standardizes data preparation, experiment
management, evaluation, model registration, and deployment readiness.

------------------------------------------------------------------------

# Training Objectives

-   Reproducible training
-   Versioned datasets and models
-   Comparable experiments
-   Automated evaluation
-   Deployment-ready artifacts
-   Continuous improvement

------------------------------------------------------------------------

# Training Pipeline Overview

``` text
Dataset
   │
   ▼
Validation
   │
   ▼
Preprocessing
   │
   ▼
Feature Engineering
   │
   ▼
Train / Validation / Test
   │
   ▼
Model Training
   │
   ▼
Hyperparameter Tuning
   │
   ▼
Evaluation
   │
   ▼
Model Registry
   │
   ▼
Deployment Approval
```

------------------------------------------------------------------------

# Supported Models

  ---------------------------------------------------------------------------------
  Model                Framework                   Dataset
  -------------------- --------------------------- --------------------------------
  Semantic Entropy     PyTorch                     SEP_Dataset
  Probe                                            

  Fusion Trust Model   LightGBM                    Fusion_Trust_Model_Datasets

  Claim Type           Transformers / scikit-learn Claim_Type_Classifier
  Classifier                                       

  Claim Extraction     Seq2Seq / Prompt            Claim_Extraction

  Claim Dependency     Graph / GNN                 Claim_Dependency

  Cross-Model          Embeddings + NLI            Cross_Model_Agreement
  Agreement                                        

  Trust Calibration    Isotonic / Conformal        Trust_Calibration\_(Conformal)
  ---------------------------------------------------------------------------------

------------------------------------------------------------------------

# Training Environment

-   Python 3.11+
-   PyTorch
-   LightGBM
-   Transformers
-   scikit-learn
-   pandas
-   NumPy

Hardware: - GPU for transformer models - CPU acceptable for calibration
and LightGBM

------------------------------------------------------------------------

# Data Preparation

Steps:

1.  Load dataset
2.  Validate schema
3.  Clean invalid records
4.  Engineer features
5.  Split train/validation/test
6.  Save preprocessing metadata

------------------------------------------------------------------------

# Model-Specific Training

## Semantic Entropy Probe

Inputs: - Hidden-state features - Entropy features

Loss: - Binary Cross Entropy

Outputs: - Hallucination probability

------------------------------------------------------------------------

## Fusion Trust Model

Inputs: - Verification signals

Algorithm: - LightGBM Regressor / Ranker

Outputs: - Trust score - Risk level

------------------------------------------------------------------------

## Claim Type Classifier

Training: - Text embeddings - Supervised classification

Metrics: - Accuracy - F1

------------------------------------------------------------------------

## Claim Extraction

Current: - Prompt templates

Future: - Fine-tuned encoder-decoder transformer

Metrics: - Exact Match - ROUGE - BLEU

------------------------------------------------------------------------

## Claim Dependency

Current: - Rule-based graph

Future: - Graph Neural Network

Metrics: - Edge precision - Edge recall

------------------------------------------------------------------------

## Cross-Model Agreement

Training data: - Multiple LLM responses

Outputs: - Agreement score

------------------------------------------------------------------------

## Trust Calibration

Methods: - Isotonic Regression - Conformal Prediction

Metrics: - Expected Calibration Error - Coverage

------------------------------------------------------------------------

# Hyperparameter Tuning

Recommended:

-   Grid Search
-   Random Search
-   Bayesian Optimization (future)

Track: - Parameters - Metrics - Runtime - Dataset version

------------------------------------------------------------------------

# Evaluation

Common metrics:

-   Accuracy
-   Precision
-   Recall
-   F1
-   ROC-AUC
-   RMSE
-   MAE
-   ECE

Each model should define deployment thresholds.

------------------------------------------------------------------------

# Experiment Tracking

Each run records:

-   Experiment ID
-   Dataset version
-   Code commit
-   Hyperparameters
-   Metrics
-   Checkpoint
-   Runtime
-   Author
-   Timestamp

------------------------------------------------------------------------

# Model Registry

Registry metadata:

-   Model name
-   Version
-   Framework
-   Dataset version
-   Metrics
-   Artifact location
-   Deployment status

------------------------------------------------------------------------

# Deployment Readiness Checklist

-   Dataset validated
-   Metrics exceed threshold
-   Regression tests passed
-   Artifact exported
-   Registry updated
-   Rollback version available

------------------------------------------------------------------------

# CI/CD Integration

``` text
Commit
  │
  ▼
Training Pipeline
  │
  ▼
Evaluation
  │
  ▼
Registry
  │
  ▼
Staging
  │
  ▼
Production
```

------------------------------------------------------------------------

# Repository Layout

``` text
training/
├── configs/
├── datasets/
├── preprocessing/
├── feature_engineering/
├── trainers/
├── evaluators/
├── experiments/
├── checkpoints/
├── registry/
└── scripts/
```

------------------------------------------------------------------------

# Design Principles

1.  Reproducible experiments.
2.  Immutable datasets.
3.  Versioned models.
4.  Automated evaluation.
5.  Deployment only after approval gates.
6.  Complete experiment traceability.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 12 defined the dataset pipeline.
-   **Chapter 13 defines the model training lifecycle.**
-   Chapter 14 describes the inference pipeline used in production.
