# TruthLayer Custom ML Models & Datasets

Yes, TruthLayer requires **three custom ML artifacts** to be trained before it can be considered production-ready. These are not massive Large Language Models; they are lightweight, targeted classifiers that sit *on top* of the LLM's outputs.

## 1. The Fusion Model (LightGBM/XGBoost)
The Fusion model is the brain of the verification engine. Instead of relying on just one signal (like traditional RAG which only checks retrieval), the Fusion model looks at 5 different signals at once to decide if a claim is a hallucination.

**Dataset structure:** `data/synthetic_examples/fusion_training_data.csv`
- **Inputs (Features):**
  - `sep_score`: Internal model uncertainty (Semantic Entropy Probe)
  - `semantic_entropy`: Uncertainty measured across multiple generated samples
  - `kernel_entropy`: Continuous language disagreement (KLE)
  - `retrieval_score`: How relevant the retrieved Qdrant documents are (BM25 + Dense)
  - `nli_grounding`: DeBERTa MNLI probability that the retrieved text supports the claim
- **Output (Target):** `label` (1 = True, 0 = Hallucination)

## 2. Conformal Calibration
Conformal Calibration doesn't need its own separate dataset format—it uses a held-out 20% split of the **Fusion Training Data**. 
Instead of predicting True/False, conformal prediction observes how often the Fusion model is right or wrong on this held-out data to calculate a **guaranteed confidence interval** (e.g., "We are 90% mathematically certain this claim is true").

## 3. Semantic Entropy Probe (SEP)
Generating multiple responses to calculate Semantic Entropy (SE) is slow and expensive. The SEP is a linear probe (like Logistic Regression) trained to look directly into the "brain" (hidden state tensors) of the LLM and predict what the Semantic Entropy *would be*, without having to generate multiple samples.

**Dataset structure:** `data/synthetic_examples/sep_probe_training_data.csv`
- **Inputs (Features):** `hidden_state_vector` (A 4096-dimensional array of floats extracted from the last layer of Qwen/Llama during generation)
- **Output (Target):** `target_semantic_entropy` (The actual calculated entropy that the probe is trying to learn to predict)
