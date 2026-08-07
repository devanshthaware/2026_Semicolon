# DATASET_SPECIFICATION.md

# Argus Dataset Specification

## Purpose

Defines datasets required by each AI component.

  Model                    Dataset                               Status
  ------------------------ ------------------------------------- ----------
  Semantic Entropy Probe   Hidden states + semantic entropy      Required
  Fusion Trust Model       Verification signals + trust labels   Required
  Claim Type Classifier    Claims + labels                       Future
  Claim Extraction         Responses + atomic claims             Future
  Trust Calibration        Validation set                        Required

## Semantic Entropy Probe Dataset

### Features

-   hidden_mean
-   hidden_std
-   hidden_norm
-   final_token_entropy
-   max_logit
-   logit_margin
-   attention_dispersion
-   retrieval_confidence
-   semantic_consistency

### Target

-   target_semantic_entropy

## Fusion Trust Dataset

### Features

-   sep_score
-   semantic_entropy
-   kernel_language_entropy
-   nli_agreement
-   retrieval_confidence
-   symbolic_verification
-   temporal_validation
-   cross_model_agreement
-   critic_score
-   calibration_factor

### Targets

-   fusion_trust_score
-   risk_level
-   verified

## Future Datasets

### Claim Type

claim → label

### Claim Extraction

response → atomic claims

### Claim Dependency

conversation → dependency graph

## Dataset Versioning

v1.0 Synthetic

v2.0 Real LLM generated

v3.0 Research benchmark
