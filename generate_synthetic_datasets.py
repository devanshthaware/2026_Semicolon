import csv
import json
import random
from pathlib import Path

OUT_DIR = Path("data/synthetic_examples")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 1. Generate Fusion & Conformal Data
# The fusion model takes the 5 signals and predicts whether the claim is True (1) or Hallucination (0)
fusion_headers = ["claim_id", "prompt", "claim", "sep_score", "semantic_entropy", "kernel_entropy", "retrieval_score", "nli_grounding", "label"]

fusion_rows = []
for i in range(1, 101):
    is_true = random.choice([0, 1])
    
    # If the claim is true, the signals generally look "better" (lower entropy, higher retrieval/NLI)
    if is_true:
        sep = round(random.uniform(0.0, 0.4), 3)
        se = round(random.uniform(0.0, 0.3), 3)
        ke = round(random.uniform(0.0, 0.35), 3)
        ret = round(random.uniform(0.7, 1.0), 3)
        nli = round(random.uniform(0.75, 1.0), 3)
    else:
        # Hallucinations typically have higher uncertainty and lower grounding
        sep = round(random.uniform(0.4, 1.0), 3)
        se = round(random.uniform(0.5, 1.0), 3)
        ke = round(random.uniform(0.6, 1.0), 3)
        ret = round(random.uniform(0.1, 0.6), 3)
        nli = round(random.uniform(0.0, 0.5), 3)

    fusion_rows.append([
        f"CLM-{i:03d}",
        f"Synthetic prompt {i}",
        f"Synthetic generated claim {i}",
        sep, se, ke, ret, nli,
        is_true
    ])

with (OUT_DIR / "fusion_training_data.csv").open("w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(fusion_headers)
    writer.writerows(fusion_rows)

# 2. Generate SEP Probe Data
# The SEP probe is trained on the hidden states of the LLM to predict the semantic entropy directly
sep_headers = ["claim_id", "hidden_state_vector", "target_semantic_entropy"]
sep_rows = []

for i in range(1, 51):
    # A real hidden state would be 4096-dimensional. We'll mock a smaller 8-dim vector for readability in the CSV.
    mock_hidden_state = [round(random.uniform(-1.0, 1.0), 4) for _ in range(8)]
    target_se = round(random.uniform(0.0, 1.0), 3)
    
    sep_rows.append([
        f"CLM-{i:03d}",
        json.dumps(mock_hidden_state),
        target_se
    ])

with (OUT_DIR / "sep_probe_training_data.csv").open("w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(sep_headers)
    writer.writerows(sep_rows)

# 3. Generate Markdown Explanation
md_content = """# TruthLayer Custom ML Models & Datasets

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
"""

with (OUT_DIR / "ML_DATASETS_EXPLANATION.md").open("w", encoding="utf-8") as f:
    f.write(md_content)

print("Synthetic datasets and documentation generated in data/synthetic_examples/")
