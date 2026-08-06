# TruthLayer v2: From Hallucination *Detection* to Hallucination *Correction*
### Upgraded Full Technical Project Plan — HackPreneur '26, PS 7.1

---

## What's actually different in v2 (read this first)

v1 built a very strong **detector**: four signals fused, calibrated, streamed live. That alone beats 95% of submissions. v2 upgrades the system along four axes that almost nobody at a hackathon will touch, each grounded in 2024–2025 research:

1. **Detection → Correction.** v1 tells you a claim is unreliable. v2 actively *fixes* it in real time via activation steering, before the token ever reaches the user — the difference between a smoke detector and a sprinkler system.
2. **Static calibration → Online calibration.** v1's conformal guarantee assumes the calibration set matches deployment. v2 adds **adaptive conformal inference** so the guarantee holds even as the model, domain, or user base drifts after launch — a real production concern, not a hackathon fiction.
3. **Passive verification → Adversarial multi-agent verification.** v2 adds a debate/critic layer where a second agent is explicitly incentivized to attack the first agent's claims, closing the blind spot where a single model's own uncertainty signals miss a confidently-wrong answer.
4. **A detector → A defensible research contribution.** v2 proposes one genuinely novel fused metric (below) that you can frame as your own contribution, not just an integration of others' work — this is what makes judges treat you like you did research, not assembly.

---

## 1. Upgraded Architecture

```
                              USER QUERY
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │   BASE LLM (streaming,        │
                    │   hidden states exposed)      │
                    └───────────────┬─────────────┘
                                     ▼
                    ┌─────────────────────────────┐
                    │  CLAIM DECOMPOSITION ENGINE   │
                    └───────────────┬─────────────┘
                                     ▼
        ┌────────────────────────────────────────────────────────────┐
        │                DETECTION LAYERS (v1, retained)                │
        │  L1 SEP · L2 Semantic Entropy · L3 Kernel Lang. Entropy ·      │
        │  L4 Retrieval-Grounded NLI                                    │
        └───────────────────────────┬──────────────────────────────────┘
                                     ▼
        ┌────────────────────────────────────────────────────────────┐
        │       L5 — MECHANISTIC INTERVENTION (NEW)                      │
        │  activation steering toward "truthful" direction               │
        │  applied ONLY when L1–L4 flag risk above threshold             │
        │  (Inference-Time Intervention / Adaptive Activation Steering)  │
        └───────────────────────────┬──────────────────────────────────┘
                                     ▼
        ┌────────────────────────────────────────────────────────────┐
        │       L6 — ADVERSARIAL CRITIC AGENT (NEW)                      │
        │  a second, independently-prompted agent whose ONLY job is      │
        │  to attack the claim; escalates to a judge on disagreement     │
        └───────────────────────────┬──────────────────────────────────┘
                                     ▼
                    ┌─────────────────────────────┐
                    │   NOVEL FUSION METRIC (NEW)   │
                    │  Spectral-Causal Fusion Score  │
                    │  (see §3)                      │
                    └───────────────┬─────────────┘
                                     ▼
                    ┌─────────────────────────────┐
                    │  ONLINE CONFORMAL CALIBRATION │
                    │  (adaptive threshold, drift-   │
                    │   aware, NEW vs v1's static)   │
                    └───────────────┬─────────────┘
                                     ▼
              ┌──────────────────────────────────────────┐
              │  DECISION: pass-through / steer & retry /  │
              │  flag-and-explain / block                  │
              └──────────────────────────────────────────┘
```

**Key control-flow upgrade:** L5 and L6 are *not* always-on — they're triggered conditionally by the L1–L4 fused risk score, in a cascade. This is deliberate: correction and debate are expensive, so you only pay the cost when the cheap signals say it's warranted. This cascade design is itself a legitimate systems contribution to highlight.

---

## 2. New Layer 5 — Mechanistic Intervention: correcting, not just flagging

**Research basis:**
Prior work shows LLMs often possess truthful knowledge internally even when their output is false — the failure is in *decoding*, not *knowledge*. Two concrete, citable techniques exploit this:

- **Inference-Time Intervention (ITI)** — shifts activations along a small set of attention-head directions found (via probing) to correlate with truthfulness, applied at inference with no retraining.
- **Adaptive Activation Steering (ACT)** — instead of a single fixed steering vector, ACT dynamically selects among multiple truthfulness-related steering vectors and adjusts steering *intensity* per-query. Reported truthfulness gains include large improvements across LLaMA/Alpaca/Vicuna-family models on TruthfulQA, with results holding up to 65B-parameter models.
- **TruthFlow** (newer, flow-matching-based) — learns *query-specific* correction vectors rather than one universal vector, addressing the main weakness of fixed-vector steering methods (a single "truth direction" doesn't generalize well across very different query types).

**Your implementation choice:** start with ITI/ACT (simpler, well-documented, reproducible in a weekend) as your baseline correction mechanism; if time allows, upgrade to a query-conditional steering vector (TruthFlow-style) as your stretch goal and explicitly frame it as "addressing a known limitation of fixed-vector steering" in your deck — reviewers who know the space will recognize you understand the trade-off, not just implemented a recipe.

**Pipeline:**
1. L1–L4 flag a claim as high-risk
2. Extract the relevant steering vector(s) for the flagged failure type (factual vs. logical vs. commonsense — ACT explicitly supports category-specific vectors)
3. Regenerate the flagged span with activation steering applied
4. Re-run detection (L1–L4, cheap layers only) on the regenerated span
5. If still flagged after N attempts (cap N=2 for latency), fall back to explicit flagging + retrieved evidence shown to the user, rather than silently forcing an answer — **never let steering hide an unresolved uncertainty**, always disclose

---

## 3. New Layer 6 — Adversarial Critic Agent (multi-agent verification)

**Research basis:** Multi-agent debate has been shown to reduce hallucination and improve factual consistency by having agents iteratively challenge each other's claims rather than a single model self-checking. A stronger variant, counterfactual debate, presets one agent to argue a *specific* stance and forces it to defend it against a skeptical critic, which surfaces weak justifications more reliably than open-ended debate. Multi-agent hallucination mitigation strategies (adversarial + voting) also show measurable error-rate reduction with bounded communication cost when paired with an entropy-based stopping rule (i.e., don't debate forever — stop when agreement entropy drops below a threshold).

**Why this matters here specifically:** L1–L4 measure a *single model's* uncertainty and grounding. But a model can be low-entropy, well-grounded by weak retrieval, and still wrong (e.g., a subtly outdated or ambiguous retrieved passage). An independent critic agent, prompted adversarially ("find the flaw in this claim; you are rewarded for finding real errors, not for agreeing"), catches a different error distribution than the four detection layers. Treat it as an ensemble diversity move, not a redundant check.

**Implementation:**
- Critic agent: same or different base LLM, system prompt explicitly adversarial and stance-agnostic
- Bounded debate: max 2 rounds (cost control), with an **entropy-based stopping rule** — stop early if debater/critic agreement stabilizes
- Judge: a lightweight rule (does the critic's rebuttal cite a retrieval-grounded contradiction? if yes, escalate to L5 correction; if it's just stylistic disagreement, ignore)
- Cost control: this layer only triggers on claims that are borderline in the L1–L4 fused score (not confidently fine, not confidently bad) — this is where debate adds the most value and costs the least overall

---

## 4. The Novel Contribution: Spectral-Causal Fusion Score (SCFS)

This is the piece you can legitimately claim as *your* idea, built on top of cited primitives — exactly what judges want to see instead of "we integrated four papers."

**Motivation:** KLE (Layer 3) tells you how uncertain the model's *output distribution* is. Steering-vector alignment (from Layer 5's internals) tells you how far the model's *internal representation* is from its own learned "truthful" direction before any correction is applied. These are two different views of the same underlying failure — one from the output side (spectral/informational), one from the causal/mechanistic side (representational). Nobody in the papers above fuses these two specific signals into one score.

**Proposed formula:**

```
SCFS = α · KLE_normalized  +  (1-α) · cos_dist(h_claim, v_truthful)
```

where:
- `KLE_normalized` = kernel language entropy scaled to [0,1] via the calibration set's empirical CDF
- `cos_dist(h_claim, v_truthful)` = cosine distance between the claim's hidden-state representation and the truthfulness steering direction identified for L5
- `α` = a learned mixing weight (fit via logistic regression against labeled hallucination data, not hand-picked — report the fitted value, don't guess it live)

**Why this is defensible as novel, not just "a weighted average":** it's fusing an *information-theoretic* signal (entropy over an output distribution) with a *causal/representational* signal (distance from a direction known to causally affect truthfulness when steered). That's a genuinely different combination than "ensemble four classifier scores," and you can say so explicitly, with a one-paragraph ablation showing SCFS outperforms either component alone on your benchmark. Even a modest improvement (a few AUROC points) is a legitimate result to report — don't oversell it, just show the number.

---

## 5. Upgraded Calibration: Online / Adaptive Conformal Inference

**Problem with v1's static conformal layer:** it assumes the calibration distribution matches deployment forever. In reality, the query distribution shifts (new topics, new users, model updates) and a fixed threshold's coverage guarantee silently degrades — a real, well-known failure mode.

**Fix:** Adaptive Conformal Inference (Gibbs & Candès) updates the calibration threshold online using a simple feedback rule based on whether the most recent prediction interval covered the true outcome, without needing to retrain the whole pipeline:

```
q̂_{t+1} = q̂_t + γ · (δ - err_t)
```

where `err_t = 1` if the true label fell outside the predicted interval at time `t`, `δ` is the target miscoverage rate, and `γ` is a step size. This lets the coverage guarantee track distribution shift live.

**What you demo:** simulate a distribution shift mid-demo (switch topic domain, e.g. from general trivia to a specialized technical domain) and show the calibration plot adapting in real time rather than silently breaking — this is a much stronger live-demo moment than a static number, because it's provably robust to exactly the failure mode judges will ask about if they know the space ("what happens when your calibration set doesn't match production?").

---

## 6. Adversarial Robustness — red-team your own detector

A system that claims to detect unreliable outputs should be tested against inputs *designed* to fool it. This is the section that makes it feel security-engineered, not just ML-engineered.

**Attacks to run against your own pipeline:**
1. **Paraphrase attacks** — rephrase a false claim in low-perplexity, fluent language and see if L1/L2 entropy signals stay low (they should still catch it via L4 grounding — report where each layer breaks)
2. **Retrieval poisoning** — inject a plausible-but-wrong passage into the retrieval corpus and see if L4 alone would be fooled, but L1–L3 (model-internal) catch it anyway — this is your strongest argument for *why fusion matters*, not just "more signals = better," but "signals fail independently, so fusion is robust to single-point failures"
3. **Prompt injection against the critic agent** — try to get the debate agent to rubber-stamp a false claim through leading prompts, and measure how often it happens
4. **Confidently-wrong stress test** — construct claims where the model is low-entropy but factually wrong (the hardest case for entropy-based methods) and report the failure rate honestly

**Report this as a limitations table, not a hidden weakness.** A slide titled "Where TruthLayer still fails, and why" is more credible to technical judges than a slide claiming perfection.

---

## 7. Production & Scaling Architecture

- **Cascade design for cost control:** L1 (cheap, always-on) → L2/L3 (triggered only if L1 borderline) → L4 (parallel, always-on since retrieval is cheap) → L5/L6 (triggered only if fused score is borderline-to-bad) — report the % of claims that reach each layer in your benchmark run, this is a genuine systems metric
- **Multi-tenant API design:** stateless FastAPI service, request-scoped claim decomposition, horizontal scaling via k8s if you want to gesture at "production-ready" (don't over-invest time here, a Docker Compose setup with a clear scaling note is enough for a hackathon)
- **Monitoring/drift dashboard:** track the online conformal threshold over time, per-domain AUROC drift, and layer-trigger rates — this is the operational counterpart to the adaptive calibration story
- **Latency budget:** publish a target SLA (e.g., "<200ms added latency at p50 for pass-through claims, <2s for claims requiring L5/L6 correction") and measure against it — a stated, measured budget is more convincing than an unstated "it's fast"

---

## 8. Startup / Business Framing (ties back to "startup potential")

- **Positioning:** not "a hallucination detector" but **trust infrastructure for enterprise LLM deployments** — the same pitch as an API security layer or a payments fraud layer: invisible middleware that every serious LLM product will eventually need
- **Wedge market:** regulated verticals where hallucination has direct legal/financial/medical consequences (legal drafting, clinical documentation, financial advisory chatbots) — these buyers will pay for provable guarantees, which is exactly what your conformal layer gives you that a competitor's "vibes-based" LLM-judge doesn't
- **Moat:** the fused, calibrated, model-agnostic middleware is harder to replicate than a single-technique wrapper — and the online calibration + adversarial robustness testing story is a genuine technical moat, not just a UX one
- **Go-to-market wedge:** ship as a drop-in middleware SDK (a few lines around any existing LLM call) rather than requiring a platform migration — lowest friction adoption path

---

## 9. Updated Development Plan

### Phase 0 — Foundations (unchanged from v1)
Base LLM with hidden-state access, retrieval + NLI baseline, vector DB.

### Phase 1 — Detection core (v1 layers)
L1 SEP, L2 semantic entropy, L3 kernel entropy, L4 retrieval-grounded NLI, basic fusion + static conformal wrapper (get v1 fully working before adding anything new — always keep a working fallback).

### Phase 2 — Correction layer (NEW)
Implement ITI or ACT-style steering on the flagged spans; build the regenerate-and-reverify loop with a bounded retry cap.

### Phase 3 — Adversarial verification (NEW)
Critic agent with adversarial prompting, bounded debate rounds, entropy-based stopping rule, judge logic.

### Phase 4 — Novel fusion + online calibration (NEW)
Implement SCFS, fit the mixing weight on labeled data, replace static conformal wrapper with adaptive conformal inference.

### Phase 5 — Red-team your own system (NEW)
Run the four adversarial attack classes above, produce the honest limitations table.

### Phase 6 — Systems, frontend, benchmarking, pitch
Cascade latency profiling, streaming UI with correction visualized (show the "before steering" and "after steering" version of a corrected claim — this is a great demo moment), full ablation table (now including SCFS and the correction layer's before/after accuracy delta), calibration drift demo, deck.

---

## 10. Updated Key Papers to Cite

Everything from v1, plus:
- Li, Patel, Viégas, Pfister, Wattenberg, "Inference-Time Intervention: Eliciting Truthful Answers from a Language Model," NeurIPS 2023
- Wang et al., "Adaptive Activation Steering: A Tuning-Free LLM Truthfulness Improvement Method for Diverse Hallucination Categories," WWW 2025 (ACT)
- "TruthFlow: query-specific truthful representation correction via flow matching," 2025
- Du et al., "Improving Factuality and Reasoning in Language Models through Multiagent Debate," 2023/2024 (MAD)
- "Counterfactual Debating with Preset Stances for Hallucination Elimination of LLMs" (CFMAD)
- Gibbs & Candès, "Adaptive Conformal Inference Under Distribution Shift," NeurIPS 2021 — for the online calibration layer

---

## 11. Updated Starter Repos

Everything from v1, plus:
- Search for the official ITI repo (`likenneth/honest_llama`) — inference-time intervention implementation
- ACT authors' released code (linked from the WWW'25 paper) for adaptive steering vectors
- AutoGen or a lightweight custom asyncio debate loop for the critic-agent layer (don't over-engineer the debate orchestration — a simple two-agent loop with a stopping rule is enough)
- MAPIE or a custom implementation for the adaptive/online conformal update rule (the update rule itself is about 5 lines of code — implement it directly rather than searching for a heavyweight library)

---

## 12. Updated Pitch Narrative

1. Same opening as v1: the confidently-wrong failure mode nobody else catches
2. **New beat:** "But detecting isn't enough — so we built the correction loop." Show a live before/after: a hallucinated claim, flagged, steered, re-verified, corrected — in real time, in the stream
3. **New beat:** "We didn't just trust our own model's self-assessment — we built an adversarial critic that's rewarded for finding our mistakes." Show a case where the critic catches something the four detection layers missed
4. Same ablation centerpiece as v1, now including SCFS and the correction layer's accuracy lift
5. **New closing beat:** the online calibration drift demo — "our guarantee doesn't just hold on day one, it holds as the world changes underneath the model"
6. **New closing beat:** the limitations table — "here's exactly where we still fail, measured, not hidden"
7. Close with the trust-infrastructure business framing
