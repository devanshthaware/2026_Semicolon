# 12_DATASET_PIPELINE.md

# TruthLayer System Design

## Chapter 12 -- Dataset Pipeline

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the dataset architecture used to train, validate,
version, and maintain every custom AI model in TruthLayer. It describes
the complete data lifecycle from collection through preprocessing,
training, evaluation, and deployment.

------------------------------------------------------------------------

# Dataset Philosophy

TruthLayer datasets are designed to be:

-   Versioned
-   Reproducible
-   Model-specific
-   Traceable
-   Extensible
-   Validated before training

Each model owns a canonical dataset while sharing common preprocessing
standards.

------------------------------------------------------------------------

# Dataset Architecture

``` text
Raw Data Sources
        │
        ▼
Data Collection
        │
        ▼
Cleaning & Validation
        │
        ▼
Normalization
        │
        ▼
Feature Engineering
        │
        ▼
Dataset Versioning
        │
        ▼
Train / Validation / Test Split
        │
        ▼
Model Training
        │
        ▼
Evaluation
        │
        ▼
Model Registry
```

------------------------------------------------------------------------

# Dataset Repository Structure

``` text
datasets/
├── SEP_Dataset/
│   ├── raw/
│   ├── processed/
│   ├── train.csv
│   ├── validation.csv
│   ├── test.csv
│   └── metadata.json
│
├── Fusion_Trust_Model_Datasets/
├── Claim_Type_Classifier/
├── Claim_Extraction/
├── Claim_Dependency/
├── Cross_Model_Agreement/
└── Trust_Calibration_(Conformal)/
```

------------------------------------------------------------------------

# Dataset Catalogue

  Dataset                          Consumer Model           Primary Labels
  -------------------------------- ------------------------ ---------------------------
  SEP_Dataset                      Semantic Entropy Probe   Hallucination probability
  Fusion_Trust_Model_Datasets      Fusion Trust Model       Trust score
  Claim_Type_Classifier            Claim Type Classifier    Claim type
  Claim_Extraction                 Claim Extraction Model   Atomic claims
  Claim_Dependency                 Claim Dependency Model   Claim graph
  Cross_Model_Agreement            Agreement Model          Agreement score
  Trust_Calibration\_(Conformal)   Calibration              Calibrated confidence

------------------------------------------------------------------------

# Common Dataset Schema

Recommended metadata fields:

-   dataset_name
-   version
-   source
-   created_at
-   updated_at
-   record_count
-   label_schema
-   preprocessing_version

------------------------------------------------------------------------

# Data Collection

Possible sources:

-   Synthetic generation
-   Internal evaluation pipelines
-   Benchmark datasets
-   Human annotation
-   Verification logs

Each record should have a unique identifier and provenance metadata.

------------------------------------------------------------------------

# Data Validation

Validation checks include:

-   Missing values
-   Duplicate records
-   Invalid labels
-   Schema consistency
-   Feature ranges
-   Class balance

Datasets failing validation must not enter the training pipeline.

------------------------------------------------------------------------

# Preprocessing Pipeline

``` text
Raw Dataset
    │
    ▼
Cleaning
    │
    ▼
Normalization
    │
    ▼
Feature Engineering
    │
    ▼
Encoding
    │
    ▼
Split
```

Examples:

-   Tokenization
-   Text normalization
-   Numeric scaling
-   JSON parsing
-   Label encoding

------------------------------------------------------------------------

# Dataset Versioning

Every dataset version records:

-   Semantic version
-   Schema version
-   Source revision
-   Creation timestamp
-   Compatible model version

Example:

``` text
SEP_Dataset
v1.0.0
```

------------------------------------------------------------------------

# Train / Validation / Test

Recommended split:

-   Train: 80%
-   Validation: 10%
-   Test: 10%

Splits should be deterministic and reproducible.

------------------------------------------------------------------------

# Feature Engineering

Examples:

## Semantic Entropy Probe

-   Hidden-state statistics
-   Token entropy
-   Probability features

## Fusion Trust Model

-   SEP score
-   NLI score
-   Retrieval confidence
-   Symbolic result
-   Temporal result
-   Agreement score

## Claim Type

-   TF-IDF or transformer embeddings
-   Linguistic features

------------------------------------------------------------------------

# Training Data Flow

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
Training
   │
   ▼
Evaluation
```

------------------------------------------------------------------------

# Dataset Storage

Recommended formats:

-   CSV
-   Parquet
-   JSONL

Metadata:

-   JSON

Large artifacts:

-   Object storage

------------------------------------------------------------------------

# Quality Metrics

Track:

-   Record count
-   Label distribution
-   Duplicate rate
-   Missing value rate
-   Drift indicators
-   Annotation consistency

------------------------------------------------------------------------

# Security

-   Version control metadata
-   Immutable releases
-   Backup strategy
-   Access control
-   Audit trail

------------------------------------------------------------------------

# Design Principles

1.  One canonical dataset per model.
2.  Immutable dataset releases.
3.  Reproducible preprocessing.
4.  Explicit schema versioning.
5.  Full traceability from dataset to model.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 11 defined the AI models.
-   **Chapter 12 defines the dataset pipeline and lifecycle.**
-   Chapter 13 describes the complete model training pipeline.
