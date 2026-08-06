from __future__ import annotations

from dataclasses import dataclass, field

from app.retrieval import HybridRetriever, RetrievedPassage, tokens


@dataclass
class RetrievalTrace:
    query: str
    attempt: int
    top_score: float
    stop_reason: str | None = None


@dataclass
class EvidenceAgentResult:
    passages: list[RetrievedPassage]
    trace: list[RetrievalTrace] = field(default_factory=list)


class BoundedEvidenceAgent:
    """Deterministic bounded retrieval agent.

    It can reformulate a weak lexical query once; it cannot declare truth, create
    evidence, or exceed its fixed attempt budget. A LangGraph adapter can wrap
    this state machine later without changing the safety boundary.
    """

    def __init__(self, retriever: HybridRetriever, maximum_attempts: int = 2, confidence_target: float = 0.55) -> None:
        self.retriever = retriever
        self.maximum_attempts = maximum_attempts
        self.confidence_target = confidence_target

    def retrieve(self, claim: str) -> EvidenceAgentResult:
        query = claim
        trace: list[RetrievalTrace] = []
        for attempt in range(1, self.maximum_attempts + 1):
            passages = self.retriever.retrieve(query)
            score = passages[0].score if passages else 0.0
            if score >= self.confidence_target:
                trace.append(RetrievalTrace(query, attempt, score, "sufficient-evidence"))
                return EvidenceAgentResult(passages, trace)
            trace.append(RetrievalTrace(query, attempt, score))
            query = self._reformulate(claim)
        trace[-1].stop_reason = "attempt-budget-exhausted"
        return EvidenceAgentResult(passages, trace)

    def _reformulate(self, claim: str) -> str:
        stop_words = {"the", "a", "an", "is", "are", "was", "were", "that", "this", "and", "or", "of", "to", "in"}
        return " ".join(word for word in claim.split() if word.lower().strip(".,!?;") not in stop_words) or claim
