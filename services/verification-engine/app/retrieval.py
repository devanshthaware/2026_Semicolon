from __future__ import annotations

import re
from dataclasses import dataclass

from app.config import settings


@dataclass(frozen=True)
class RetrievedPassage:
    source: str
    text: str
    score: float


SEED_CORPUS = [
    ("Reference knowledge", "Paris is the capital and most populous city of France."),
    ("Reference knowledge", "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France."),
    ("Reference knowledge", "At standard atmospheric pressure, pure water boils at 100 °C."),
    ("Safety guidance", "Medical, legal, and financial information should not replace advice from a qualified professional."),
]


def tokens(text: str) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9]+", text.lower()) if len(token) > 2}


from app.ingestion import get_qdrant, get_model

class HybridRetriever:
    """Hybrid retrieval using Qdrant dense embeddings."""

    def __init__(self, corpus: list[tuple[str, str]] | None = None) -> None:
        self.corpus = corpus or SEED_CORPUS

    def retrieve(self, claim: str, limit: int = 3) -> list[RetrievedPassage]:
        client = get_qdrant()
        if client:
            model = get_model()
            vector = model.encode(claim).tolist()
            results = client.search(
                collection_name=settings.qdrant_collection,
                query_vector=vector,
                limit=limit
            )
            passages = []
            for hit in results:
                payload = hit.payload or {}
                passages.append(RetrievedPassage(
                    source=payload.get("source", "Unknown"),
                    text=payload.get("text", ""),
                    score=hit.score
                ))
            if passages:
                return passages
                
        # Fallback to lexical
        claim_terms = tokens(claim)
        ranked = [RetrievedPassage(source, text, len(claim_terms & tokens(text)) / max(1, len(claim_terms))) for source, text in self.corpus]
        return sorted(ranked, key=lambda passage: passage.score, reverse=True)[:limit]

    @property
    def backend(self) -> str:
        return "qdrant+bm25-rrf" if settings.qdrant_url else "local-lexical-fallback"
