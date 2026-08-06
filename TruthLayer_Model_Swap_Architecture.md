# TruthLayer — Model-Swap Architecture
### Hardware-decoupled design: laptop today, workstation/production tomorrow, zero logic rewritten

---

## 0. The core idea

Every layer of TruthLayer calls models by **role** (`small`, `large`, `ensemble`, `judge`), never by a hardcoded model name or backend. Swapping from a 16GB RAM / 6GB VRAM laptop to a full workstation or production GPU cluster becomes a **one-line config change**, not a rewrite. This is also, not incidentally, the real proof of the "model-agnostic middleware" business pitch — it's true by construction instead of asserted.

---

## 1. What changes between hardware tiers, and what never does

### Changes only:
- Which specific model fills each role
- Which backend serves that model (local quantized runtime vs. vLLM vs. hosted API)

### Never changes:
- Claim decomposition engine
- Claim-type classifier + dual-routing logic
- Symbolic solver (Z3), code execution sandbox
- Retrieval + NLI grounding (L4)
- Fusion model (LightGBM) + conformal calibration
- Conversational risk ledger
- Provenance signing
- FastAPI orchestration and streaming logic
- Frontend (entire app)

**One exception, flagged deliberately:** L1 (SEP) is trained on a specific model's hidden states. Upgrading hardware and swapping to a bigger base model means **re-running the offline SEP training job** against the new model's hidden states — this is the one step that isn't a free config swap. Budget for it explicitly; don't assume it's automatic.

---

## 2. Config-driven model profiles

```python
# model_config.py — the ONLY file that changes between laptop and beefy hardware

MODEL_PROFILE = "laptop"   # ← change this one line when you have better hardware

PROFILES = {
    "laptop": {
        "small":     {"name": "qwen2.5-1.5b-instruct-q4",  "backend": "llama_cpp"},
        "large":     {"name": "llama-3.2-3b-instruct-q4",  "backend": "llama_cpp"},
        "ensemble":  [
            {"name": "llama-3.2-3b-instruct-q4", "backend": "llama_cpp"},
            {"name": "qwen2.5-1.5b-instruct",     "backend": "groq_api"},
            {"name": "mistral-7b-instruct",       "backend": "openrouter_api"},
        ],
        "judge":     {"name": "mistral-7b-instruct", "backend": "openrouter_api"},
    },
    "workstation": {
        "small":     {"name": "llama-3.1-8b-instruct",  "backend": "vllm"},
        "large":     {"name": "qwen2.5-32b-instruct",   "backend": "vllm"},
        "ensemble":  [
            {"name": "llama-3.1-70b-instruct", "backend": "vllm"},
            {"name": "qwen2.5-32b-instruct",   "backend": "vllm"},
            {"name": "mistral-large",          "backend": "vllm"},
        ],
        "judge":     {"name": "mistral-large", "backend": "vllm"},
    },
}
```

Every layer reads its model by role (`"small"`, `"large"`, `"ensemble"`, `"judge"`) — never by name — so the eight-plus files that call these models never need to change when hardware changes.

---

## 3. Backend abstraction — same call signature, any backend

```python
def get_model(role: str):
    cfg = PROFILES[MODEL_PROFILE][role]
    if cfg["backend"] == "llama_cpp":
        return LlamaCppClient(cfg["name"])
    elif cfg["backend"] == "vllm":
        return VLLMClient(cfg["name"])
    elif cfg["backend"] in ("groq_api", "openrouter_api"):
        return APIClient(cfg["backend"], cfg["name"])
```

Same call signature everywhere regardless of backend:
- `.generate(prompt)`
- `.hidden_states(prompt)` (only supported/needed on local backends, for L1 SEP)

**Build this early (Phase 0).** It's cheap to write cleanly now and expensive to retrofit once every layer has hardcoded a specific client.

---

## 4. Laptop hardware plan (16GB RAM / 6GB VRAM)

| Component | Laptop-realistic choice | Why |
|---|---|---|
| Small/cheap model | Qwen2.5-1.5B or Llama-3.2-3B, 4-bit GGUF | ~1.5–2.5GB VRAM |
| Escalated/large model | Llama-3.1-8B / Qwen2.5-7B, 4-bit GGUF via llama.cpp | ~4.5–5.5GB VRAM, don't use vLLM (assumes more headroom) |
| Cross-architecture ensemble (L6b) | 1 self-hosted small model + 1–2 via free-tier API (Groq / OpenRouter) | 3 resident model families don't fit in 6GB even quantized |
| L4 NLI, retrieval, fusion, calibration, signing, Z3 | Unchanged from any hardware tier | CPU-bound or trivial VRAM footprint |

**Model swap-in/out latency** (small ↔ large on load-swap) is real on this hardware and must be measured directly, not assumed — fold it into the worst-case latency number, and measure it in Phase 0, not Phase 7, so it can't surface as a demo-breaking surprise the week of the pitch.

---

## 5. Production/workstation hardware plan

| Component | Production-realistic choice |
|---|---|
| Small/cheap model | Llama-3.1-8B via vLLM |
| Escalated/large model | Qwen2.5-32B+ via vLLM |
| Cross-architecture ensemble (L6b) | 3 fully self-hosted distinct architectures via vLLM, resident simultaneously |
| Everything else | Identical to laptop tier — no changes |

---

## 6. What this buys you for the pitch

A one-line deck claim that's true because of how the system is built, not just stated:

> "The entire verification stack is decoupled from model choice by design. The laptop demo you're watching runs on quantized 1.5B–7B models. In production, this is a one-line config change to 70B+ models — with zero verification logic rewritten."

This is a stronger production-readiness signal than most hackathon teams can credibly make, precisely because it's demonstrable rather than asserted — you can literally show the `MODEL_PROFILE` line changing during Q&A if a judge pushes on it.

---

## 7. One-time costs when upgrading hardware (don't treat as free)

1. **Re-train the L1 SEP probe** against the new base model's hidden states (offline batch job, ~1 hour)
2. **Re-measure typical-case and worst-case latency** on the new hardware — don't carry over laptop numbers
3. **Re-run the calibration/conformal fit** if the new base model's score distribution shifts meaningfully from the laptop model's (cheap check: compare fused-score distributions before and after swap; refit conformal wrapper only if they diverge)
