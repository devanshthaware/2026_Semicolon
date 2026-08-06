# TruthLayer v4: Verifiable Trust Infrastructure for LLM Outputs
### Final Consolidated Project Plan — merges v1 + v2 + v3, with every identified issue fixed or explicitly disclosed
### HackPreneur '26, PS 7.1

---

## 0. What changed from v3 → v4 (read this first)

v1 built a calibrated detector. v2 added correction and adversarial debate. v3 added symbolic/temporal/cross-model/ledger/provenance layers. v4 doesn't add new capability — **it fixes the seams between all of it**, so the system survives hard technical questioning instead of just looking impressive on a diagram. Specifically:

1. **A philosophy slide that turns complexity into inevitability** (§1) — every layer is justified by a distinct failure mode, and each entry now also states what it *doesn't* solve, so follow-up questions land on an answer you already gave.
2. **Real-time claim made honest**, not aspirational — explicit typical-case *and* worst-case latency, a hard cap on total escalation depth per claim, and a resolved answer for what happens to a partially-streamed response when the cascade escalates mid-stream (§4).
3. **Calibration and evaluation fully specified** — exact datasets, exact labels, and a disclosed, non-circular construction method for the custom numeric/temporal benchmark (§7).
4. **Claim decomposition and cross-turn dependency detection both named as the same class of known weak point**, with a concrete mitigation (dual-routing on low confidence) instead of a hand-wave (§3, §5).
5. **The receipt is reframed honestly**: it proves *process integrity*, not truth, and the key-custody question is answered before a judge asks it (§8).
6. **Cross-architecture "independence" caveat added**: architectural diversity is not data-source diversity, and this is disclosed rather than overclaimed (§3).
7. **An explicit floor**: a stated minimum build that still tells the complete story end-to-end if 40% of the roadmap doesn't ship (§11).

---

## 1. Design Philosophy — why every layer exists

Lead with this slide. It's the single highest-leverage fix in v4: it turns "why do you have seven layers" from a liability into your strongest answer.

| Failure mode | Layer | What it catches | What it explicitly does NOT catch (say this out loud) |
|---|---|---|---|
| Model doesn't know, gives inconsistent answers across resampling | L2 Semantic Entropy | Confabulation / knowledge gaps | Consistent-but-wrong answers (low entropy, still false) |
| Model's own hidden states already "know" the entropy without resampling | L1 SEP | Same as L2, near-zero latency | Doesn't transfer across model families — one probe per base model |
| Discrete clustering loses partial semantic relationships | L3 KLE | Fine-grained uncertainty structure | Still a language-similarity signal, not a truth signal |
| Claim isn't grounded in any evidence | L4 Retrieval-grounded NLI | Ungrounded factual claims | Evidence can be stale, poisoned, or simply wrong itself |
| Model *could* say the true thing but decodes the false one | L5 Correction (steering) | Recoverable claims fixable without regeneration from scratch | A single "truth direction" may not exist for every claim type — always disclose, never silently force |
| A single model's self-assessment is a biased witness | L6a Adversarial critic | Confidently-wrong claims within one model | Judge/critic can share the same blind spot if not architecturally distinct |
| Different architectures still trained on overlapping web data | L6b Cross-arch ensemble | Blind spots specific to one architecture | Widespread internet myths can fool all architectures at once — disclose this |
| Language is fluent but the math/logic is simply wrong | Symbolic verification (Z3 / code exec) | Arithmetic and logical inconsistency, *provably* | Only covers claims correctly parsed into a formal expression — parsing errors are a real failure mode |
| Evidence is well-grounded but out of date | Temporal validity | Staleness on time-sensitive facts | Depends on evidence having usable publish/modified dates, which many sources lack |
| Error in turn 3 gets treated as settled fact by turn 7 | Conversational ledger | Multi-turn compounding errors | Cross-turn dependency detection is the same class of hard problem as claim decomposition |
| "Trust us" doesn't scale to auditors who can't access your servers | Provenance signing | Independently verifiable process record | Proves the pipeline ran and produced a score — does **not** prove the claim is true |

**One sentence for the deck:** *"Each layer exists because a different, specific way of being wrong requires a different, specific way of being caught — and we can tell you exactly where each one still can't help."*

---

## 2. Full v4 Architecture

```
                                   USER QUERY
                                        │
                                        ▼
                    ┌───────────────────────────────────┐
                    │  COST-AWARE MODEL CASCADE             │
                    │  small model first → escalate to      │
                    │  large model only if L1 uncertain     │
                    │  (escalation policy fixed — see §4)   │
                    └────────────────┬────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │      CLAIM DECOMPOSITION ENGINE       │
                    │  (known fragile step — see §3)        │
                    │  + claim-type classifier               │
                    │  factual / numeric-logical / temporal │
                    │  low-confidence → DUAL-ROUTE (fix)    │
                    └────────────────┬────────────────────┘
                                      ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                    ROUTED VERIFICATION                        │
        ├───────────────┬───────────────┬───────────────┬─────────────┤
        │ FACTUAL claims │ NUMERIC/LOGIC  │ TIME-SENSITIVE │ ALL claims  │
        │ → L1-L4        │ → symbolic     │ → temporal     │ → L6b       │
        │ semantic       │ solver (Z3) /  │ validity /     │ cross-arch  │
        │ entropy stack  │ code execution │ staleness      │ ensemble    │
        │ (L1 caveat:    │ (parse-error   │ (metadata-gap  │ (correlated-│
        │ model-specific │ caveat — §3)   │ fallback — §5) │ data caveat │
        │ probe — §3)    │                │                │ — §3)       │
        └───────┬───────┴───────┬───────┴───────┬───────┴──────┬──────┘
                └───────────────┴───────────────┴───────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │  L5 correction + L6a critic debate    │
                    │  cross-family judge (fix — §3)        │
                    │  FULL re-verification post-correction  │
                    │  (fix: not cheap-layers-only — §3)     │
                    └────────────────┬────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │  Spectral-Causal Fusion Score          │
                    │  + online conformal calibration        │
                    └────────────────┬────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │  CONVERSATIONAL RISK LEDGER            │
                    │  (dependency detection = known fragile │
                    │  step, same class as decomposition—§5) │
                    └────────────────┬────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │  PROVENANCE SIGNING LAYER              │
                    │  proves PROCESS integrity, not truth   │
                    │  key custody disclosed — §8            │
                    └────────────────┬────────────────────┘
                                      ▼
                         OUTPUT + VERIFIABLE RECEIPT
                    (worst-case + typical-case latency
                     both published — §4)
```

---

## 3. Layer Specs, with every issue fixed inline

### L1 — Semantic Entropy Probes (SEP)
White-box linear probe on hidden states predicting semantic entropy in one forward pass instead of k samples. Base repo: `OATML/semantic-entropy-probes`.

**Fix applied — model-specificity disclosed:** SEP is trained per base model. The cost cascade escalates between a small and a large model, so **each model in the cascade needs its own trained probe**. This means L1 is not model-agnostic even though the overall middleware pitch is — say so explicitly in the deck: *"L1 is model-specific by construction; L2, L4, and L6b are the layers that are genuinely model-agnostic."* For closed-API comparison mode (GPT-4o/Claude), L1 is unavailable — the system degrades to L2/L4 only, which was already a disclosed v1 limitation and remains one.

### L2 — Semantic Entropy (SE)
Multi-sample generation, bidirectional-entailment clustering, Shannon entropy over clusters. Use Bayesian adaptive sampling (arXiv:2504.03579) to avoid naive k=10 sampling every time.

### L3 — Kernel Language Entropy (KLE)
Continuous similarity graph via a kernel matrix over generations; von Neumann entropy over its eigenspectrum, instead of throwing away partial semantic relationships the way hard clustering does.

### L4 — Retrieval-Grounded NLI
Dense + sparse hybrid retrieval, DeBERTa-v3-large-MNLI entailment check against retrieved evidence.

### L5 — Mechanistic Intervention (Correction)
ITI/ACT-style activation steering on flagged spans, regenerate, re-verify, bounded retry (N=2), fall back to disclosed flag-and-evidence rather than silently forcing an answer.

**Fix applied — re-verification depth:** v2's original loop re-checked only the cheap layers (L1–L4) after each steering attempt. **v4 requires the final re-verification pass (after the last allowed retry) to run the full stack that originally flagged the claim** — if L6a or L6b was what caught the issue, a cheap-layer-only recheck can't tell you the steered version is actually fixed. Intermediate retries can stay cheap for latency; only the *last* check before pass-through needs to match the original detection depth.

### L6a — Adversarial Critic Agent
Second agent whose only job is to attack the first agent's claim; escalates to a judge on disagreement; entropy-based stopping rule so debate doesn't run forever.

**Fix applied — judge independence:** the judge that resolves disagreement must come from a **different model family than both debating agents**. Using a same-family judge reintroduces the exact same-architecture blind spot that L6b exists to solve, one layer later — this was previously unspecified and is now a named requirement.

### L6b — Cross-Architecture Ensemble Verification
Query 2–3 architecturally distinct open-weight models (e.g., Llama-3.1, Qwen2.5, Mistral) on paraphrased versions of the same claim; reuse L2's entailment-clustering machinery for cross-model agreement scoring; gate behind a borderline-score trigger since this is the most expensive layer.

**Fix applied — correlated-data caveat disclosed:** architecturally distinct models can still share heavily overlapping web-crawl training data. A widespread internet myth can fool all three at once — architectural diversity buys you protection from architecture-specific blind spots, not from shared-training-data blind spots. State this explicitly rather than implying full independence. Where feasible, prefer at least one model with a meaningfully different training-data provenance (e.g., a model with disclosed distinct pretraining sources) to strengthen the independence claim — flag as a stretch goal, not a blocker.

**Fix applied — majority vote is a detection signal, not a correctness signal:** "2/3 models disagree" tells you *something is wrong*, not *which answer is right*. Don't let the demo imply the majority answer is trusted more unless separately validated against ground truth.

### Symbolic / Formal Verification (numeric-logical claims)
Claim-type classifier tags claims; arithmetic/statistical claims parsed into a computable expression and checked via sandboxed code execution; logical claims encoded as constraints and checked with Z3.

**Fix applied — misrouting and parsing errors:** two previously-unaddressed failure points, now both handled:
1. **Claim-type misclassification** silently defeats this whole layer if a numeric-logical claim gets tagged `factual`. **Fix: any claim where the type-classifier's confidence falls below a threshold gets dual-routed** — sent through both the language-based stack and the symbolic path, and reconciled rather than assigned to one path only.
2. **NL→formula parsing can itself be wrong**, independent of whether the arithmetic is right — this can produce a false "mismatch" on genuinely correct math. Report parser accuracy separately from solver accuracy in the ablation table (§7), the same way claim decomposition accuracy needs its own reported number.

### Temporal Validity / Staleness Checking
Extracts a claim's implicit temporal scope, checks evidence publish/modified date against current date, weights staleness risk by how volatile that fact category typically is, prefers more recent passages over higher-ranked-but-older ones.

**Fix applied — missing-metadata fallback (§5).**

### Conversational Risk Ledger
Per-conversation ledger of `{claim_id, verification_status, confidence_interval, turn_introduced}`; propagates a "cannot fully verify" flag forward when a later turn depends on an earlier unresolved claim; tracks turn-over-turn volatility of the fused score as its own signal.

**Fix applied — dependency detection fragility disclosed (§5), same treatment as claim decomposition.**

### Cost-Aware Model Cascade
Small model first; escalate generation itself to a larger model only when L1's own signal is uncertain.

**Fix applied — streaming/UX resolution and worst-case latency (§4).**

### Provenance Signing Layer
Signed manifest (claim, evidence hash, fused confidence interval, which layers ran, calibration version, timestamp), C2PA-pattern public-key signature over a SHA-256 hash of the manifest.

**Fix applied — honest framing and key custody disclosed (§8).**

---

## 4. Real-Time Claim, Made Honest

**Typical case:** most claims pass through the always-on cheap layers only (L1, L4) and add well under 200ms at p50.

**Worst case (new, previously unstated):** a genuinely hard claim can trigger L5 correction retries + L6a debate + L6b cross-architecture querying + symbolic solving simultaneously. **Publish both numbers.** Cap total escalation depth explicitly — e.g., a claim can trigger at most one full L5 retry cycle *and* one L6b query round, not unbounded combinations, so worst-case latency is a stated ceiling, not an open-ended risk a judge can find with arithmetic.

**Streaming/cascade UX conflict (new, previously unresolved):** if the small model has already streamed part of an answer to the user when L1 triggers escalation to a larger model, you must pick one resolved behavior — don't leave this ambiguous:
- **Chosen approach:** commit to a small, fixed token-count "probation window" per claim (e.g., first ~15 tokens of a claim are held back from final render, not the whole response) where escalation can still swap the claim cleanly before the user sees it as "settled." Once a claim is past its probation window and rendered, a later escalation appends a visible correction rather than silently rewriting displayed text. This keeps the demo narrative ("real-time, but honest about what real-time actually means here") coherent instead of hand-waved.

**Narrative for the deck:** *"Real-time means early warning via SEP at the token level. Deep verification — cross-model, symbolic, adversarial — is asynchronous escalation with a bounded, published worst-case latency, not an instant guarantee for every claim."*

---

## 5. Known Fragile Steps (stated as a category, not buried per-layer)

Two structurally similar problems recur across the system and deserve one unified slide rather than two separate footnotes:

1. **Atomic claim decomposition** (splitting streamed text into checkable subject–predicate–object units) — non-trivial, error-prone, especially incrementally on a partial token stream.
2. **Cross-turn dependency detection** (does turn 7 reason from an unresolved claim in turn 3) — the same class of semantic-parsing difficulty, one level up.

**Fix applied:** name both explicitly as *"known weak points and a stated future-research direction,"* in the same breath, rather than only disclosing the first one. A judge who catches you disclosing one but not the structurally identical other will read it as selective honesty, which undercuts the whole "we disclose our limitations" credibility play.

**Temporal metadata fallback (fix applied):** when evidence lacks a usable publish/modified date, do not silently skip the staleness check or silently assume it's current — surface an explicit **"staleness: unknown"** state to the user, distinct from both "fresh" and "stale." An honest unknown is a stronger answer than a guess dressed as a check.

---

## 6. Calibration & Training — fully specified

**Datasets (fix applied — no longer vague):**
- **TruthfulQA** — adversarial factual QA, confidently-wrong claims
- **HaluEval** — hallucination benchmark across QA/dialogue/summarization
- **SelfCheckGPT's WikiBio dataset** — sentence-level hallucination labels for claim-level eval
- **Custom numeric/logical benchmark** — hand-constructed arithmetic/logic claims paired with correct/incorrect versions
- **Custom temporal benchmark** — claims paired with evidence passages of varying, labeled recency

**Fix applied — non-circularity for custom sets:** the numeric/logical and temporal benchmarks are the two you build yourselves, so they carry a real circularity risk (grading your own exam with an answer key you wrote for your own solver). Mitigate and disclose:
- Construct the custom benchmark *before* tuning the symbolic/temporal thresholds against it, and freeze it (a simple held-out split, not a fancy scheme, is enough for a hackathon)
- Have someone on the team who did not write the solver logic write the test cases, or vice versa, to avoid designing tests around known solver behavior
- State this construction process explicitly in the deck — a judge who asks "how do you know your numeric benchmark isn't just testing what you already knew your solver could do" needs a real answer, not a shrug

**Calibration:** fusion via LightGBM (interpretable, SHAP available) on the multi-signal feature vector; conformal calibration for a statistically valid confidence interval; **online/adaptive conformal inference** (Gibbs & Candès) so the coverage guarantee holds under domain drift post-launch, demoed live by switching topic domain mid-demo and showing the interval adapt rather than silently break.

---

## 7. Full Benchmark & Ablation Plan

| Configuration | What it isolates | Metric |
|---|---|---|
| L1–L4 only (v1 baseline) | Core detection | AUROC |
| + L5 correction | Accuracy lift from active fixing | AUROC + before/after accuracy |
| + L6a same-model debate | Value of adversarial self-critique | AUROC |
| + L6b cross-architecture ensemble | Value of architectural diversity (with correlated-data caveat noted) | AUROC, specifically on confidently-wrong subset |
| + symbolic verification | Precision on numeric/logical claims | Precision, reported separately from parser accuracy |
| + temporal validity | Precision on time-sensitive claims | Precision, with "staleness: unknown" rate reported |
| + conversational ledger | Detection of multi-turn compounding errors | Recall on seeded dependency chains |
| Full system | End-to-end result | AUROC |

**Also report (fix applied — previously missing):**
- Claim-decomposition accuracy on its own, as a standalone number, not folded silently into downstream results
- NL→formula parser accuracy on its own, separate from solver correctness
- Latency: typical-case and worst-case, per layer and end-to-end (§4)
- Cost: `$ / 1000 verified claims`, cascade vs. always-large-model
- Empirical coverage of conformal intervals vs. target coverage (calibration plot)

**Limitations table (kept, expanded):** run the v2 red-team suite (paraphrase attacks, retrieval poisoning, prompt injection against the critic, confidently-wrong stress test) against the full v4 stack, and present a **curated top 4–5 limitations**, not an exhaustive list of every caveat in this document — the point of honesty is credibility, not exhausting the judges. Pick the ones that best demonstrate you understand the system's real edges: the receipt-proves-process-not-truth distinction, the correlated-training-data caveat on L6b, the claim-decomposition/dependency-detection fragility, and the worst-case latency ceiling are the four strongest to lead with.

---

## 8. Provenance Signing — Honest Framing

**What it proves:** the manifest cryptographically confirms that TruthLayer's pipeline ran, which layers fired, what evidence hash was used, and what confidence interval was produced — verifiable by anyone, without touching your servers.

**Fix applied — what it does NOT prove, stated up front:** the signature attests to **process integrity**, not to the truth of the underlying claim. A wrong verdict signs exactly as validly as a correct one. Have this exact line ready: *"We sign the verification process, not the fact itself — think notary, not oracle."*

**Fix applied — key custody disclosed:** if TruthLayer's own server generates and holds the signing keypair, a verifier is confirming "TruthLayer's server produced this," not an independent third party's attestation — structurally closer to a company signing its own certificate than a notarized fact from an uninvolved party. This doesn't remove the real value (tamper-evidence, auditability, portability without re-running the pipeline) — but don't let "you don't have to trust us" imply more than it delivers. For a hackathon, implement the core mechanism (hash, sign with a locally generated keypair, verify) and explicitly note in the deck that production deployment would integrate with existing C2PA tooling / a real certificate authority rather than rolling your own trust root.

---

## 9. Production & Scaling Architecture

- Cascade design for cost control, with the escalation-depth cap from §4 stated as a hard limit, not just a philosophy
- Stateless FastAPI service, request-scoped claim decomposition, Docker Compose is enough for a hackathon with a clear scaling note (k8s gesture optional, don't over-invest)
- Monitoring/drift dashboard: online conformal threshold over time, per-domain AUROC drift, layer-trigger rates
- Published latency SLA: typical-case AND worst-case (§4), not just one number

---

## 10. Startup / Business Framing

- **Positioning:** trust infrastructure for enterprise LLM deployments, not "a hallucination detector" — same category as an API security layer or a fraud-detection layer
- **Fix applied — "model-agnostic" claim scoped correctly:** the middleware is model-agnostic at the L2/L4/L6b layers; L1 (SEP) requires per-model-family probe training and white-box access, and degrades gracefully to L2/L4-only on closed APIs. State this precisely rather than claiming blanket model-agnosticism — it reads as more credible, not less.
- **Wedge market:** regulated verticals (legal, medical, financial) where "prove it happened" matters as much as "it happened" — directly served by the provenance layer, correctly framed per §8
- **Moat:** the fused, calibrated, model-agnostic-where-it-matters middleware, plus online calibration and adversarial robustness testing, is harder to replicate than a single-technique wrapper
- **Go-to-market:** drop-in middleware SDK, a few lines around any existing LLM call

---

## 11. Development Plan — with an explicit floor

### Phase 0–1: Foundations + v1 detection core
Base LLM with hidden-state access (or degraded L2/L4-only mode for closed APIs), retrieval + NLI baseline, vector DB, L1–L4, static conformal wrapper.

### Phase 2: v2 correction + adversarial debate
ITI/ACT steering, regenerate-reverify loop with the fixed full-depth final recheck (§3), critic agent with a cross-family judge (§3), SCFS fusion metric, online conformal calibration.

### Phase 3: v3 routed verification
Claim-type classifier with dual-routing on low confidence (§3), symbolic verification (sandboxed exec + Z3), temporal validity checker with the "staleness: unknown" state (§5).

### Phase 4: v3 cross-architecture ensemble
2–3 open-weight models behind a common interface, reused entailment-clustering for agreement scoring, borderline-trigger gating, correlated-data caveat documented (§3).

### Phase 5: v3 conversational ledger
Per-conversation claim graph, turn-over-turn volatility tracking, dependency-detection fragility documented alongside claim decomposition (§5).

### Phase 6: v3 provenance signing
Manifest schema, keypair generation + signing/verification, honest process-vs-truth framing baked into the UI copy itself (§8), not just the pitch.

### Phase 7: Cost cascade + full benchmarking
Small-model-first cascade with the streaming/UX resolution from §4, full ablation table (§7) including the newly-added standalone parser/decomposition accuracy numbers, cost-per-1000-claims comparison, worst-case latency measurement.

### Phase 8: Frontend, red-team, pitch
Streaming UI with claim-type badges + layer trace + signed-receipt view, full red-team suite against the complete stack, curated top-4-5 limitations table, deck built around the ablation table + live provenance-verification demo as the closing beat.

### The floor (new — previously missing)
If time runs out, this subset still tells the complete, coherent story end-to-end:
**L1–L4 fused detection → L5 correction with full-depth recheck → L6a debate → SCFS + conformal calibration → provenance signing.**
That alone is a working detect-correct-verify-and-sign pipeline. Symbolic verification, temporal checking, L6b cross-architecture ensembling, and the conversational ledger are high-value additions layered on top, each independently demoable even if the others don't finish — none of them are load-bearing for the core story to hold together.

---

## 12. Pitch Narrative — final version

1. **Open** with the failure mode nobody else shows: confidently, consistently wrong.
2. **Philosophy slide** (§1): each layer is a different failure mode, with its own honestly-stated blind spot.
3. **Live demo, detect + correct:** a hallucinated claim flagged, steered, fully re-verified, corrected in the stream.
4. **Live demo, adversarial critic:** the debate catching something the four detection layers missed, judged by a cross-family model.
5. **New beat — math errors:** a fluent, well-grounded numeric claim that's simply arithmetic wrong, caught by the symbolic layer, missed by every language-based signal.
6. **New beat — staleness:** a grounded-but-outdated fact flagged, including an honest demo of the "staleness: unknown" state when metadata is missing.
7. **New beat — the conversation trust trail:** turn 7 depending on an unresolved claim from turn 3, with the dependency-detection caveat stated in the same breath.
8. **Closing beat — the receipt:** an independent verifier confirming a signed claim without touching your servers, immediately followed by the honest one-liner — *"this proves our process ran, not that the claim is true — think notary, not oracle"* — which reads as senior judgment, not a weakness.
9. **Close with:** the full ablation table, the cost-cascade number, the typical/worst-case latency numbers, and the curated top-4-5 limitations table.

---

## 13. Key Papers / Standards to Cite

- Farquhar, Kuhn, Gal et al., "Detecting hallucinations in large language models using semantic entropy," *Nature*, 2024
- Kossen, Han, Razzak, Schut, Malik, Gal, "Semantic Entropy Probes," arXiv:2406.15927
- Nikitin, Kossen, Gal, Marttinen, "Kernel Language Entropy," NeurIPS 2024
- "Hallucination Detection on a Budget: Efficient Bayesian Estimation of Semantic Entropy," arXiv:2504.03579
- Orgad et al., "LLMs Know More Than They Show," ICLR 2024
- Angelopoulos & Bates, "A Gentle Introduction to Conformal Prediction"
- Li, Patel, Viégas, Pfister, Wattenberg, "Inference-Time Intervention," NeurIPS 2023
- Wang et al., "Adaptive Activation Steering (ACT)," WWW 2025
- "TruthFlow: query-specific truthful representation correction via flow matching," 2025
- Du et al., "Improving Factuality and Reasoning through Multiagent Debate," 2023/2024
- "Counterfactual Debating with Preset Stances (CFMAD)"
- Gibbs & Candès, "Adaptive Conformal Inference Under Distribution Shift," NeurIPS 2021
- Zhang et al., "SAC³: Reliable Hallucination Detection via Semantic-aware Cross-check Consistency," 2023
- "Verify when Uncertain: Beyond Self-Consistency in Black Box Hallucination Detection," 2025
- "SpikeScore" (2025/2026) — multi-turn uncertainty-fluctuation signal
- C2PA technical specification — provenance manifest design pattern
- de Moura & Bjørner, "Z3: An Efficient SMT Solver"

---

## 14. Starter Repos to Fork/Study

- `OATML/semantic-entropy-probes` — SEP
- `jlko/semantic_uncertainty` — original semantic entropy
- `potsawee/selfcheckgpt` — black-box consistency baseline
- `scikit-learn-contrib/MAPIE` — conformal prediction
- `likenneth/honest_llama` — inference-time intervention
- ACT authors' released code (linked from WWW'25 paper)
- AutoGen or a lightweight custom asyncio loop for the critic-agent debate
- Z3 (`Z3Prover/z3`) for symbolic/logical verification

---

## 15. Suggested Team Roles (4–5 people)

1. **ML/Uncertainty lead** — L1–L3, fusion model, conformal calibration, correlated-data caveat writeup for L6b
2. **Retrieval/Verification lead** — L4, symbolic solver, temporal checker, claim decomposition + dual-routing logic
3. **Systems/backend lead** — cascade orchestration, streaming/UX escalation resolution (§4), latency profiling (typical + worst-case), provenance signing
4. **Frontend lead** — streaming UI, claim badges, receipt viewer, ablation toggle
5. **Research/eval + pitch lead** — benchmark construction (with non-circularity discipline for custom sets), ablation tables, red-team suite, curated limitations table, deck and live demo narrative
