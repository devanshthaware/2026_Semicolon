# TruthLayer: Real-Time Hallucination Detection & Factual Grounding System
### Full Technical Project Plan — HackPreneur '26, PS 7.1 (Agentic AI)

---

## 0. One-line pitch

A model-agnostic middleware layer that sits between any LLM and its output, fuses **white-box uncertainty signals**, **black-box semantic entropy**, **kernel-based spectral uncertainty**, and **retrieval-grounded entailment checking** into a single statistically calibrated trust score per claim — with provable confidence bounds via conformal prediction — streamed live, at production latency.

The thesis: hallucination detection is not a fact-checking problem, it's an **uncertainty quantification problem with a grounding problem bolted on**. Most teams will solve only the second half. We solve both, and prove our error bounds instead of asserting them.

---

## 1. System Architecture

```
                         ┌─────────────────────────────────────────┐
                         │              USER QUERY                 │
                         └───────────────────┬───────────────────┘
                                              ▼
                         ┌─────────────────────────────────────────┐
                         │        BASE LLM (streaming)              │
                         │  hidden states exposed via hooks         │
                         └───────────────────┬───────────────────┘
                                              ▼
                 ┌────────────────────────────────────────────────────┐
                 │            CLAIM DECOMPOSITION ENGINE                │
                 │  splits streamed output into atomic, checkable       │
                 │  claims (subject–predicate–object units)             │
                 └───────────────────┬────────────────────────────────┘
                                      ▼
        ┌─────────────────────────────────────────────────────────────────┐
        │                    FOUR PARALLEL SIGNAL LAYERS                    │
        ├───────────────┬───────────────┬───────────────┬─────────────────┤
        │  L1: White-box │ L2: Black-box │ L3: Kernel     │ L4: Retrieval-  │
        │  hidden-state  │ semantic      │ Language       │ grounded NLI    │
        │  probe (SEP)   │ entropy (SE)  │ Entropy (KLE)  │ entailment      │
        │  ~5-20ms/claim │ multi-sample  │ spectral graph │ check           │
        │                │ clustering    │ entropy        │                │
        └───────┬───────┴───────┬───────┴───────┬───────┴────────┬────────┘
                └───────────────┴───────────────┴────────────────┘
                                      ▼
                 ┌────────────────────────────────────────────────────┐
                 │         FUSION MODEL (gradient-boosted trees /      │
                 │         logistic regression, interpretable)         │
                 │         input: [SEP, SE, KLE, NLI-agreement,        │
                 │                 retrieval-confidence]                │
                 └───────────────────┬────────────────────────────────┘
                                      ▼
                 ┌────────────────────────────────────────────────────┐
                 │      CONFORMAL CALIBRATION LAYER                     │
                 │      converts fused score → statistically valid      │
                 │      confidence interval with coverage guarantee     │
                 └───────────────────┬────────────────────────────────┘
                                      ▼
                 ┌────────────────────────────────────────────────────┐
                 │   OUTPUT: per-claim trust score + evidence graph +   │
                 │   correction/flag/pass-through decision              │
                 └────────────────────────────────────────────────────┘
```

---

## 2. The Four Signal Layers — Theory, Math, Implementation

### Layer 1 — Semantic Entropy Probes (SEP): white-box, near-zero latency

**Idea:** Hallucination risk is often linearly decodable from a model's own hidden states, without needing to sample multiple generations. A probe trained on hidden states at the final-token position predicts the semantic entropy that *would* result from full multi-sample estimation — at a fraction of the cost.

**Why it matters for "real-time":** This is the layer that makes the system usable in production. Full semantic entropy requires 5–10 generations per claim; SEP needs one forward pass.

**Implementation:**
- Extract hidden states `h ∈ R^d` from a chosen layer (empirically, middle-to-late layers work best) at generation time
- Train a linear probe `f(h) = σ(w·h + b)` to regress against ground-truth semantic entropy computed offline on a labeled set
- Loss: mean squared error against target SE values, or binary cross-entropy if framed as hallucination/not
- Base repo to fork: `OATML/semantic-entropy-probes` (PyTorch, includes hidden-state extraction pipeline)

**Engineering note:** requires access to hidden states, so you need local inference (open-weight model via vLLM/HF Transformers) rather than a closed API — this is a deliberate architecture decision to disclose in your pitch: *"we run against open-weight models where we can instrument internals; for closed APIs we degrade gracefully to Layers 2–4 only."* This nuance alone signals engineering maturity.

---

### Layer 2 — Semantic Entropy (SE): black-box, multi-sample, the reference method

**Idea (Farquhar et al., *Nature* 2024):** Sample `k` generations for the same prompt at temperature > 0. Cluster them by **meaning**, not surface text, using bidirectional entailment (if generation A entails B and B entails A, they're the same semantic cluster). Compute Shannon entropy over the *cluster* distribution, not the token distribution.

**Math:**

Given generations `s_1, ..., s_k`, cluster into semantic equivalence classes `C_1, ..., C_m` via bidirectional NLI entailment. Estimate cluster probabilities:

```
p(C_i) = (1/k) * Σ_j 1[s_j ∈ C_i]
```

Semantic entropy:

```
SE = - Σ_i p(C_i) * log p(C_i)
```

High `SE` → the model produces semantically *different* answers across samples → it doesn't actually know → high hallucination (specifically "confabulation") risk. Low `SE` with a wrong answer indicates a different failure mode (consistent but wrong — often a training-data/reasoning error, not a knowledge-gap).

**Cost reduction (use this, don't naively sample k=10 every time):**
Use the Bayesian adaptive-sampling approach: estimate SE from as few as 1 sample when confidence is high, and only escalate to more samples for "hard" contexts where the posterior over SE is uncertain. This is a legitimate, citable improvement (arXiv 2504.03579) and gives you a real efficiency story: *"53% fewer samples than the naive baseline for equal AUROC."*

**Implementation:**
- Entailment model: DeBERTa-v3-large fine-tuned on MNLI (off the shelf, don't train from scratch)
- Clustering: greedy bidirectional-entailment clustering (standard in the SE literature)
- Base repo: `jlko/semantic_uncertainty` (original Farquhar/Kuhn implementation)

---

### Layer 3 — Kernel Language Entropy (KLE): the spectral/graph-theory layer

**Idea:** Hard clustering (Layer 2) throws away information — two generations can be *partially* semantically related without being in the same discrete cluster. KLE replaces hard clustering with a **continuous semantic similarity graph** and computes entropy via the eigenspectrum of a kernel (Gram) matrix — this is literally spectral graph theory / RKHS methods applied to language generations.

**Math:**

1. Build a semantic kernel matrix `K ∈ R^(k×k)` where `K_ij = κ(s_i, s_j)` is a similarity kernel derived from entailment probabilities (e.g., using the NLI model's soft entailment score, symmetrized: `κ(s_i,s_j) = (p_entail(s_i→s_j) + p_entail(s_j→s_i)) / 2`)
2. Compute the von Neumann entropy of the normalized kernel matrix:
```
   ρ = K / tr(K)
   KLE = -tr(ρ log ρ) = -Σ_i λ_i log λ_i
```
   where `λ_i` are the eigenvalues of `ρ`.
3. This is the quantum-information-theoretic entropy of a density matrix — exactly the same math used in quantum statistical mechanics, applied here to a semantic similarity graph. This is your strongest "feels like a research paper, not a hackathon project" flex — put the derivation on a slide.

**Why it's better than hard clustering:** captures partial semantic agreement (e.g., "Paris" and "the capital of France" are related but an NLI model might not call them strict bidirectional entailment); produces smoother, better-calibrated uncertainty estimates (NeurIPS 2024 finding).

**Implementation:**
- Compute pairwise soft-entailment scores between all `k` sampled generations
- Build the Gram matrix, normalize, eigendecompose (numpy/scipy `eigh` — cheap for k≤10)
- Reference: Kernel Language Entropy, Nikitin, Kossen, Gal & Marttinen, NeurIPS 2024

---

### Layer 4 — Retrieval-Grounded Entailment (the "did we check reality" layer)

**Idea:** Layers 1–3 detect *model uncertainty* — they catch confabulation even with zero external knowledge. But a model can be **confidently, consistently wrong** (low entropy, wrong fact) — this needs external grounding, which is what most teams do as their *entire* project. Here it's one signal among four.

**Pipeline:**
1. Decompose the response into atomic claims (subject–predicate–object triples), similar to the FActScore approach
2. For each claim, retrieve top-k evidence passages via **hybrid retrieval**: BM25 (sparse, exact term match) + dense embedding retrieval (sentence-transformers), fused via reciprocal rank fusion — don't rely on cosine similarity alone, it's noisy for factual verification
3. Run the claim + evidence pair through the NLI model: entailment / contradiction / neutral
4. Score: `NLI-agreement = p(entailment) - p(contradiction)`, plus a `retrieval-confidence` term based on retrieval score of top passage

**Implementation:**
- Vector DB: Qdrant or Weaviate (self-hosted, fast, free)
- Sparse: `rank_bm25` or Elasticsearch
- Dense encoder: `bge-large-en` or `e5-large-v2` (strong open embedders)
- Reranker (optional but strong signal): a cross-encoder reranker on top-20 retrieved passages before NLI

---

## 3. Fusion Layer — combining four signals into one number

Don't hand-wave this with an LLM call ("ask GPT if it's hallucinating given these 4 scores") — that reintroduces the exact unreliability you're trying to eliminate. Instead:

**Feature vector per claim:**
```
x = [SEP_score, SE, KLE, NLI_agreement, retrieval_confidence, retrieval_topscore]
```

**Model:** Gradient-boosted trees (LightGBM/XGBoost) or logistic regression trained on a labeled hallucination dataset (TruthfulQA, HaluEval, or SelfCheckGPT's WikiBio-derived labels). Interpretable, fast, and you can show feature-importance plots (SHAP values) in your deck — "the retrieval signal dominates on factual QA, the entropy signals dominate on reasoning tasks" is a genuinely interesting finding to report, not just a slide filler.

**Output:** `p_hallucination ∈ [0,1]` per claim.

---

## 4. Conformal Prediction — the "prove it" layer

This is what separates "we built a hallucination detector" from "we built a hallucination detector with a mathematical guarantee." Most judges will not have seen this in a hackathon submission.

**Idea:** Standard classifiers give you a point estimate with no formal guarantee. Split conformal prediction wraps any model to produce **prediction sets with a user-specified coverage guarantee** — e.g., "the true label is in this set with ≥90% probability," verified empirically on a held-out calibration set, no distributional assumptions required.

**Procedure:**
1. Hold out a calibration set `(x_i, y_i)` separate from training data
2. Define a nonconformity score, e.g. `α_i = 1 - p_model(y_i | x_i)`
3. Compute the `(1-δ)`-quantile of calibration scores: `q̂ = Quantile({α_i}, ⌈(n+1)(1-δ)⌉/n)`
4. At inference: output the prediction set `{y : 1 - p_model(y|x) ≤ q̂}`

**What you report on stage:** *"When our system flags a claim as 'grounded' at the 90% confidence level, it is empirically correct ≥90% of the time on held-out data — measured, not asserted."* This is the single strongest technical claim you can make in the whole competition.

---

## 5. Full Tech Stack

| Layer | Tool |
|---|---|
| Base LLM (self-hosted, needs hidden-state access) | Llama-3.1-8B / Qwen2.5-7B via vLLM or HF Transformers |
| Base LLM (closed-API comparison mode) | GPT-4o / Claude API — Layers 2 & 4 only, degraded mode |
| NLI / entailment | DeBERTa-v3-large-MNLI |
| Dense retrieval | bge-large-en / e5-large-v2 via sentence-transformers |
| Sparse retrieval | rank_bm25 / Elasticsearch |
| Vector DB | Qdrant (self-hosted, Docker) |
| Fusion model | LightGBM + SHAP for interpretability |
| Conformal prediction | MAPIE (Python conformal prediction library) or custom implementation |
| Backend / streaming | FastAPI + WebSockets (stream per-claim scores as tokens arrive) |
| Orchestration | Python asyncio for parallel signal-layer execution |
| Frontend | React + D3.js (evidence graph viz) + Tailwind |
| Eigendecomposition / linear algebra | NumPy / SciPy |
| Experiment tracking | Weights & Biases (probe training, ablations) |
| Infra | Docker Compose; GPU via Colab Pro / RunPod / local if available |

---

## 6. Benchmarks & Evaluation (this is what makes the pitch credible)

Use **existing, citable public benchmarks** — don't invent your own eval, judges will trust public numbers more:

- **TruthfulQA** — adversarial factual QA, good for measuring confident-wrong hallucinations
- **HaluEval** — large hallucination benchmark across QA/dialogue/summarization
- **SelfCheckGPT's WikiBio dataset** — sentence-level hallucination labels, good for claim-level eval

**Metrics to report:**
- AUROC per layer (L1 alone, L2 alone, L3 alone, L4 alone, fused) — this ablation table *is* your core result slide
- Latency per layer (ms/claim) — prove L1 is cheap and L2/L3 are used selectively
- Empirical coverage of conformal intervals vs. target coverage (calibration plot) — prove the guarantee actually holds
- Cost comparison: naive k=10 sampling vs. adaptive Bayesian sampling

---

## 7. Frontend / Demo Design (where you flex engineering + design together)

- **Streaming trust meter**: as the LLM generates, claims light up green/yellow/red in real time, not after the full response completes
- **Evidence graph panel**: click a flagged claim → see the semantic similarity graph (Layer 3) rendered as an actual node graph with edge weights = kernel similarity, and retrieved evidence passages with entailment scores
- **Confidence interval display**: show the conformal interval, not just a binary flag — e.g. "72% ± 8% (90% coverage guarantee)"
- **Ablation toggle**: a judge-facing "turn off layers" toggle so you can live-demonstrate why fusion beats any single signal — this is a strong live-demo move because it's interactive proof, not a claim

---

## 8. Development Plan (phased, flexible to your actual runway)

### Phase 0 — Research & setup (foundational, do not skip)
- Read Farquhar et al. (Nature 2024), Kossen et al. (SEP), Nikitin et al. (KLE) closely enough to reproduce their core equations from memory
- Set up base LLM inference with hidden-state hooks (vLLM or raw HF `output_hidden_states=True`)
- Stand up vector DB + hybrid retrieval baseline (this alone gives you a working demo fallback on day one)

### Phase 1 — Core signal layers
- Implement Layer 4 (retrieval + NLI) first — fastest path to *something working end-to-end*
- Implement Layer 2 (semantic entropy via sampling + clustering)
- Implement Layer 1 (train SEP on labeled hidden states, using Layer 2's outputs as training targets — this is the correct dependency order, SEP is trained to approximate SE)

### Phase 2 — Advanced signal + fusion
- Implement Layer 3 (kernel entropy / eigendecomposition)
- Train fusion model (LightGBM) on the 4-dimensional feature vector
- Implement conformal calibration wrapper

### Phase 3 — Systems engineering
- Async orchestration so all 4 layers run in parallel per claim, not sequentially
- Streaming architecture: claim decomposition must work incrementally on a token stream, not just on a completed response
- Latency profiling and optimization (this is where you earn "production-grade" credibility)

### Phase 4 — Frontend + evidence visualization
- Real-time trust meter UI
- Evidence graph (D3 force-directed graph using Layer 3's kernel matrix)
- Ablation toggle panel

### Phase 5 — Evaluation, benchmarking, and narrative
- Run full benchmark suite (TruthfulQA / HaluEval / SelfCheckGPT-WikiBio)
- Generate ablation table + calibration plot + latency chart
- Build the pitch deck around the ablation table as the centerpiece result

---

## 9. Suggested Team Roles (for a 4–5 person team)

1. **ML/Uncertainty lead** — Layers 1–3 (SEP, SE, KLE), fusion model, conformal calibration
2. **Retrieval/NLI lead** — Layer 4, vector DB, hybrid retrieval, claim decomposition
3. **Systems/backend lead** — FastAPI streaming architecture, async orchestration, latency engineering
4. **Frontend lead** — React streaming UI, D3 evidence graph, ablation toggle
5. **Research/eval + pitch lead** — benchmark running, ablation tables, deck, live demo narrative

---

## 10. Risk Mitigation / Fallbacks

- **No GPU access for hidden states?** Degrade to Layers 2 & 4 only (this is a legitimate, disclosed limitation — frame it as "graceful degradation for closed-API models," a real production concern)
- **Training data for SEP/fusion model too small?** Use TruthfulQA/HaluEval directly rather than hand-labeling — saves time and is more credible
- **Latency too high with all 4 layers?** Show the adaptive-sampling story: cheap L1 runs always, expensive L2/L3 only trigger when L1 confidence is borderline — this is itself a good engineering talking point, not just a fallback
- **Running out of time before frontend polish?** The ablation table + conformal calibration plot alone are strong enough to win on technical merit even with a plain UI — prioritize the math working correctly over visual polish if forced to choose

---

## 11. The Pitch Narrative (how to frame it on stage)

1. Open with the failure mode nobody else will show: a model that is **confidently, consistently wrong** — no retrieval-based system alone can catch this, because it requires understanding the model's own internal uncertainty, not just checking facts
2. Show the four-layer architecture diagram
3. Live demo: streaming trust meter, click into a flagged claim, show the evidence graph
4. **The centerpiece slide**: ablation table with real AUROC numbers, proving fusion beats any single method
5. **The closing claim**: the conformal calibration plot — "when we say 90% confidence, we mean it, and here's the proof on held-out data"
6. Close with the production story: latency budget, graceful degradation, and why this is architected as middleware (model-agnostic) rather than a one-off tool

---

## 12. Key Papers to Cite in Your Deck/Report

- Farquhar, Kuhn, Gal et al., "Detecting hallucinations in large language models using semantic entropy," *Nature*, 2024
- Kossen, Han, Razzak, Schut, Malik, Gal, "Semantic Entropy Probes: Robust and Cheap Hallucination Detection in LLMs," arXiv:2406.15927
- Nikitin, Kossen, Gal, Marttinen, "Kernel Language Entropy: Fine-grained Uncertainty Quantification for LLMs from Semantic Similarities," NeurIPS 2024
- "Hallucination Detection on a Budget: Efficient Bayesian Estimation of Semantic Entropy," arXiv:2504.03579
- Orgad, Toker, Gekhman, Reichart, Szpektor, Kotek, Belinkov, "LLMs Know More Than They Show: On the Intrinsic Representation of LLM Hallucinations," ICLR 2024
- Standard conformal prediction reference: Angelopoulos & Bates, "A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification"

---

## 13. Starter Repos to Fork/Study

- `OATML/semantic-entropy-probes` — official SEP code
- `jlko/semantic_uncertainty` — original semantic entropy implementation
- `potsawee/selfcheckgpt` — black-box consistency checking, good baseline/ablation comparison
- MAPIE (`scikit-learn-contrib/MAPIE`) — production-ready conformal prediction library
