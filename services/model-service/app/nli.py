from __future__ import annotations

from dataclasses import dataclass

from app.config import settings
import re

def tokens(text: str) -> set[str]:
    return set(text.lower().split())

@dataclass(frozen=True)
class NLIResult:
    relation: str
    confidence: float


class EntailmentModel:
    """NLI adapter. Configure transformers to run a MNLI checkpoint in production."""

    def __init__(self) -> None:
        self._pipeline = None

    def assess(self, claim: str, evidence: str, retrieval_score: float) -> NLIResult:
        if settings.nli_backend == "transformers":
            return self._transformers_assess(claim, evidence)
        claim_terms, evidence_terms = tokens(claim), tokens(evidence)
        mismatch = bool(claim_terms & {"not", "never", "false", "no"}) != bool(evidence_terms & {"not", "never", "false", "no"})
        if retrieval_score >= 0.55 and not mismatch:
            return NLIResult("entails", min(0.96, 0.62 + retrieval_score * 0.42))
        if mismatch and retrieval_score >= 0.35:
            return NLIResult("contradicts", 0.72)
        return NLIResult("neutral", max(0.42, 0.5 + retrieval_score * 0.3))

    def _transformers_assess(self, claim: str, evidence: str) -> NLIResult:
        try:
            from transformers import pipeline
        except ImportError as error:
            raise RuntimeError("NLI_BACKEND=transformers requires the optional ML dependencies") from error
        if self._pipeline is None:
            self._pipeline = pipeline("text-classification", model=settings.nli_model, tokenizer=settings.nli_model)
        # MNLI model label mappings differ by checkpoint; normalize them at deployment.
        output = self._pipeline({"text": evidence, "text_pair": claim}, truncation=True)[0]
        label = output["label"].lower()
        relation = "entails" if "entail" in label else "contradicts" if "contrad" in label else "neutral"
        return NLIResult(relation, float(output["score"]))
