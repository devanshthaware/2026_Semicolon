# TruthLayer v3: Verifiable Trust Infrastructure for LLM Outputs
### Upgraded Full Technical Project Plan — HackPreneur '26, PS 7.1

---

## What's new in v3 (read this first)

v1 built a calibrated detector. v2 turned it into a system that also *corrects* and *adversarially verifies*. v3 closes the three biggest remaining gaps and adds the layer that turns this from "a very good hallucination detector" into "verifiable trust infrastructure" — a genuinely different product category:

1. **Same-model blind spot → cross-architecture verification.** v2's critic agent debates using a similar model. v3 adds independent model families, because disagreement between architectures trained on different data is empirically a stronger signal than one model checking itself.
2. **Language-similarity blind spot → symbolic/formal verification.** NLI and entropy methods are bad at catching wrong arithmetic or broken logic dressed in fluent language. v3 routes numeric/logical claims to an actual solver instead of a language model.
3. **Static-fact blind spot → temporal validity checking.** A claim can be perfectly grounded in retrieved evidence and still be wrong because the evidence is stale. v3 adds an explicit staleness/as-of check.
4. **Single-turn blind spot → conversational risk accumulation.** v3 tracks how uncertainty compounds across a multi-turn conversation, using a real, measurable signal (uncertainty-fluctuation spikes) rather than re-scoring each turn in isolation.
5. **"Trust us" → provenance you can verify without re-running anything.** v3 adds cryptographically signed verification receipts, based on the same open standard the industry already uses for authenticity (C2PA), so a downstream consumer of a claim can verify it passed TruthLayer without needing access to your infrastructure at all. This is the single upgrade that most changes how judges categorize your project — from "a tool" to "infrastructure."

---

## 1. Full v3 Architecture

```
                                   USER QUERY
                                        │
                                        ▼
                    ┌───────────────────────────────────┐
                    │  COST-AWARE MODEL CASCADE (NEW)      │
                    │  cheap small model first → escalate   │
                    │  to larger model only if uncertain     │
                    └────────────────┬────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │      CLAIM DECOMPOSITION ENGINE       │
                    │  + claim-type classifier (NEW):       │
                    │    factual / numeric-logical /        │
                    │    time-sensitive                     │
                    └────────────────┬────────────────────┘
                                      ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                    ROUTED VERIFICATION                        │
        ├───────────────┬───────────────┬───────────────┬─────────────┤
        │ FACTUAL claims │ NUMERIC/LOGIC  │ TIME-SENSITIVE │ ALL claims  │
        │ → L1-L4 (v1)   │ claims (NEW)   │ claims (NEW)   │ → L6b (NEW) │
        │ semantic       │ → symbolic     │ → temporal     │ cross-arch  │
        │ entropy stack  │ solver (Z3) /  │ validity /     │ ensemble    │
        │                │ code execution │ staleness check│ verification│
        └───────┬───────┴───────┬───────┴───────┬───────┴──────┬──────┘
                └───────────────┴───────────────┴───────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │  L5 correction (v2) + L6a critic     │
                    │  debate (v2, retained)               │
                    └────────────────┬────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │  Spectral-Causal Fusion Score (v2)   │
                    │  + online conformal calibration (v2) │
                    └────────────────┬────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │  CONVERSATIONAL RISK LEDGER (NEW)     │
                    │  tracks accumulated uncertainty        │
                    │  across turns, flags claims later      │
                    │  built on unresolved earlier claims    │
                    └────────────────┬────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │  PROVENANCE SIGNING LAYER (NEW)       │
                    │  claim + evidence hash + confidence    │
                    │  interval → signed verification        │
                    │  receipt (C2PA-style manifest)          │
                    └────────────────┬────────────────────┘
                                      ▼
                         OUTPUT + VERIFIABLE RECEIPT
```

---

## 2. New: Cross-Architecture Ensemble Verification (L6b)

**Research basis:** Ensemble disagreement across genuinely different model families (not just resampling the same model) captures epistemic uncertainty that self-consistency methods miss — because open-weight models from different training runs/architectures can be queried in parallel without the shared-blind-spot problem of a model debating itself. This is formalized in cross-model/cross-question consistency approaches (SAC³-style methods), and black-box verification work confirms that when models significantly disagree, at least one is very likely hallucinating, and cross-model comparison pushes detection performance past what self-consistency alone can reach.

**Implementation:**
- Query 2-3 architecturally distinct open-weight models (e.g., Llama-3.1, Qwen2.5, Mistral) for the same decomposed claim, using semantically-equivalent paraphrased prompts (not identical wording, to avoid prompt-specific artifacts)
- Compute a cross-model agreement score using the same bidirectional-entailment clustering machinery already built for Layer 2 (semantic entropy) — this reuses existing infrastructure rather than adding a new component from scratch, which is a good engineering point to make explicitly
- Trigger condition: only run L6b on claims where the fused L1-L4 score is borderline (same cascade philosophy as L5/L6a in v2) — cross-model querying is the most expensive layer in the whole pipeline, so gate it hard

**What to report:** the delta in AUROC when L6b is added vs. withheld, specifically on the "confidently-wrong" subset of your benchmark (the hardest case, and the one single-model entropy signals structurally cannot catch) — this is your strongest ablation result in the whole project.

---

## 3. New: Symbolic / Formal Verification for Numeric & Logical Claims

**The gap this closes:** NLI and entropy-based methods are language-similarity models. "Revenue grew 47% to $2.3B from $1.8B" is fluent, low-perplexity, and might retrieve superficially relevant evidence — and still be arithmetically wrong ($1.8B × 1.47 ≈ $2.65B, not $2.3B). None of v1/v2's layers are designed to catch this.

**Implementation:**
1. Claim-type classifier (a small fine-tuned classifier or even a well-prompted LLM call) tags each decomposed claim as `factual` / `numeric-logical` / `time-sensitive`
2. `numeric-logical` claims are routed to:
   - **Arithmetic/statistical claims** → parse into a computable expression, execute in a sandboxed code interpreter, compare computed value to claimed value
   - **Logical claims** ("if X then Y", set membership, comparative claims) → encode as constraints and check satisfiability with an SMT solver (Z3), which can definitively prove or disprove logical consistency rather than estimating a probability
3. Report both raw match/mismatch and a tolerance band for claims involving rounding or estimation language ("approximately," "around") so you don't over-flag reasonable approximations

**Why this belongs in your deck as a distinct slide:** it's the one part of your system that gives a *provable* answer instead of a calibrated probability — worth contrasting explicitly: "everywhere else in TruthLayer we give you a statistically guaranteed confidence interval; here, we give you a proof."

---

## 4. New: Temporal Validity / Staleness Checking

**The gap this closes:** a claim can pass L4 (retrieval-grounded NLI) with a high entailment score against evidence that is simply out of date — a former CEO, an old law, an outdated statistic. Grounding is necessary but not sufficient; the evidence needs a validity window.

**Implementation:**
1. Extract the claim's implicit temporal scope (does it assert something that could change over time — a role, a status, a quantity — vs. something timeless — a mathematical fact, a historical event)
2. For time-sensitive claims, check the retrieved evidence's publish/last-modified date against the current date, and flag a "staleness risk" proportional to how volatile that class of fact typically is (e.g., "current CEO" changes faster than "founding year")
3. Where possible, prefer the most recent of multiple retrieved passages, and explicitly surface the evidence date to the user rather than silently trusting the top-ranked passage — a passage's retrieval rank is about textual relevance, not recency, and conflating the two is a common, fixable failure mode

**Demo moment:** deliberately ask a question whose correct answer changed after your retrieval corpus's cutoff (or seed the corpus with an intentionally outdated passage) and show the system flagging staleness risk instead of confidently asserting the outdated fact — a very concrete, easy-to-understand failure mode for a general-audience judge to grasp.

---

## 5. New: Conversational Risk Ledger

**The gap this closes:** every layer so far scores one response in isolation. In a real conversation, the model can assert an unverified claim in turn 3 and then reason *from* it as settled fact in turn 7 — and by then the surface language looks confident and consistent, even though the whole chain rests on something that was never actually verified. There's a real, measurable phenomenon here: hallucination-originated multi-turn dialogues show larger uncertainty *fluctuations* across turns than genuinely factual ones, which gives you a concrete, implementable signal rather than a vague notion of "tracking risk."

**Implementation:**
1. Maintain a per-conversation ledger: `{claim_id, verification_status, confidence_interval, turn_introduced}`
2. When a later turn's claim depends on (paraphrases, extends, or reasons from) an earlier unresolved or low-confidence claim, propagate a "cannot fully verify" flag forward rather than treating the new turn as independent
3. Track the turn-over-turn *volatility* of the fused uncertainty score itself, not just its raw value — a sudden spike after several stable, well-grounded turns is itself informative and catches exactly the self-contradiction / stance-shifting pattern that pure per-turn scoring misses
4. Surface this to the user as a running "conversation trust trail," not just a per-message badge

**Why it matters for the pitch:** most competing hallucination-detection demos are single-turn Q&A toys. A conversation-aware ledger is a clear differentiator that also happens to be the realistic deployment scenario (chatbots, not one-shot QA).

---

## 6. New: Provenance Signing — Verifiable Trust Infrastructure

This is the highest-leverage addition in v3. It reframes the entire project.

**The idea:** once a claim passes through the full TruthLayer pipeline, generate a signed manifest recording:
- The claim text and its decomposition ID
- A hash of the evidence used to ground it
- The fused confidence score and conformal interval
- Which layers ran (cascade transparency — did it need L5 correction? L6a/L6b escalation?)
- A timestamp and the calibration model version used

Sign this manifest cryptographically (public-key signature over a SHA-256 hash of the manifest, following the same structural pattern as the C2PA content-provenance standard already adopted industry-wide for AI-generated media — a manifest of assertions cryptographically signed via public-key infrastructure so any tampering invalidates the signature). Any downstream consumer — a compliance auditor, another application ingesting the claim, a end user's browser extension — can verify the claim actually passed TruthLayer's pipeline **without re-running any of it and without trusting your servers**, the same way a browser verifies an HTTPS certificate.

**Why this is the strongest business/technical move in the whole plan:**
- It turns your output into an auditable artifact, not just a UI badge — directly relevant to the regulated-vertical wedge market (legal, medical, financial) from v2's business framing, where "prove it happened" matters as much as "it happened"
- It's honest about the real limitation of watermarking/provenance approaches generally (metadata can be stripped, and no scheme is unbreakable against a fully adversarial actor) — disclosing this limitation explicitly, rather than overclaiming, is exactly the kind of intellectual honesty that reads as senior-engineer judgment to technical judges
- It composes naturally with your online conformal calibration (v2): the signed manifest can include the calibration model version, so a receipt signed six months ago is verifiably tied to the calibration state at that time, not silently reinterpreted under today's (possibly drifted) thresholds

**Implementation:** you do not need to build a certificate authority for a hackathon — implement the core mechanism (hash the manifest, sign with a locally generated keypair, verify the signature) which demonstrates the concept fully; explicitly note in your deck that production deployment would integrate with existing C2PA tooling/certificate infrastructure rather than rolling your own trust root.

---

## 7. New: Cost-Aware Model Cascade

**The idea:** don't run your full four-signal-plus-correction-plus-debate pipeline against your largest, most expensive base model for every single claim. Start with a small, cheap model; only escalate the *generation itself* (not just verification) to a larger model when the cheap model's own L1 (SEP) signal is uncertain.

**Why this belongs in v3 specifically:** it's the systems counterpart to everything else — cross-architecture verification, symbolic solving, temporal checks, and provenance signing all add cost, so you need a credible cost-control story to make the full stack believable as something that could actually run in production rather than only in a demo. Report a concrete `$ / 1000 verified claims` estimate comparing "always use the large model" vs. "cascade," using published per-token pricing for your chosen models — a real number here is worth more than any amount of hand-waving about efficiency.

---

## 8. Updated Full Benchmark & Ablation Plan

Report AUROC (and now, precision on the numeric/logical and temporal subsets specifically, since those need different metrics than a single AUROC number) for:

| Configuration | What it isolates |
|---|---|
| L1-L4 only (v1) | baseline detection |
| + L5 correction (v2) | accuracy lift from active fixing |
| + L6a same-model debate (v2) | value of adversarial self-critique |
| + L6b cross-architecture ensemble (v3) | value of architectural diversity |
| + symbolic verification (v3) | precision specifically on numeric/logical claims |
| + temporal validity (v3) | precision specifically on time-sensitive claims |
| + conversational ledger (v3) | detection of multi-turn compounding errors |
| Full system | end-to-end result |

This table alone, with real numbers, is a stronger single artifact than any other part of your presentation — it proves each addition earns its complexity rather than being decoration.

---

## 9. Updated Development Plan

### Phase 0-1 (unchanged): foundations + v1 detection core
### Phase 2 (unchanged): v2 correction + adversarial debate
### Phase 3 — v3 routed verification
- Claim-type classifier (factual / numeric-logical / time-sensitive)
- Symbolic verification path (sandboxed code execution + Z3 for logical constraints)
- Temporal validity checker (evidence date extraction + volatility-weighted staleness scoring)

### Phase 4 — v3 cross-architecture ensemble
- Stand up 2-3 open-weight models behind a common interface
- Reuse Layer 2's entailment-clustering code for cross-model agreement scoring
- Gate behind the borderline-score cascade trigger

### Phase 5 — v3 conversational ledger
- Per-conversation claim graph with dependency tracking
- Turn-over-turn uncertainty volatility tracking

### Phase 6 — v3 provenance signing
- Manifest schema design
- Keypair generation + signing/verification implementation
- (Stretch) a small verifier CLI/webpage that takes a manifest + claim and independently confirms the signature, demoed live as "here's someone else verifying our output without touching our servers"

### Phase 7 — cost cascade + full benchmarking
- Implement small-model-first cascade with escalation trigger
- Run the full ablation table (§8)
- Compute cost-per-1000-claims comparison

### Phase 8 — frontend, red-team, pitch
- Extend the streaming UI: per-claim badges now show claim type (factual/numeric/temporal), which layers ran, and a "view signed receipt" action
- Re-run the v2 adversarial red-team suite against the full v3 stack
- Build the deck around the ablation table + a live provenance-verification demo as the closing beat

---

## 10. Updated Key Papers / Standards to Cite

Everything from v1 and v2, plus:
- Zhang et al., "SAC³: Reliable Hallucination Detection in Black-Box Language Models via Semantic-aware Cross-check Consistency," 2023
- "Verify when Uncertain: Beyond Self-Consistency in Black Box Hallucination Detection," 2025 — for the cross-model verification framing
- "SpikeScore" (2025/2026) — for the multi-turn uncertainty-fluctuation signal underlying the conversational risk ledger
- C2PA (Coalition for Content Provenance and Authenticity) technical specification — for the provenance manifest design pattern
- de Moura & Bjørner, "Z3: An Efficient SMT Solver" — for the symbolic verification layer

---

## 11. Updated Pitch Narrative

1. Same opening as v2: the confidently-wrong failure mode
2. Same correction-loop and adversarial-critic beats as v2
3. **New beat:** "Some errors aren't language errors — they're math errors." Live demo: a fluent, well-grounded-looking numeric claim that's simply arithmetically wrong, caught by the symbolic layer, missed by every language-based signal
4. **New beat:** "Grounded doesn't mean current." Live demo: staleness flag on an outdated-but-well-retrieved fact
5. **New beat:** "We don't just check one turn — we watch the whole conversation." Show the risk ledger catching a claim in turn 7 that quietly depended on an unresolved claim from turn 3
6. **New closing beat — the strongest one:** "And you don't have to trust us." Pull up an independent verifier, paste in a signed receipt, show it cryptographically confirming the claim passed TruthLayer without touching your servers — end on this, it's the moment that reframes the whole project from "a tool we built" to "infrastructure other people could build on"
7. Close with the full ablation table and the cost-cascade number, then the limitations table (kept from v2) for honesty
