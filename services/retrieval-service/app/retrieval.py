from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List

from app.config import settings
from app.ingestion import get_qdrant, get_model

try:
    from rank_bm25 import BM25Okapi
except ImportError:
    BM25Okapi = None

try:
    from sentence_transformers import CrossEncoder
except ImportError:
    CrossEncoder = None

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


def tokenize(text: str) -> list[str]:
    return [token for token in re.findall(r"[a-z0-9]+", text.lower()) if len(token) > 2]


class BM25Retriever:
    """P004 - Sparse Keyword Retrieval"""
    def __init__(self, corpus: list[tuple[str, str]]):
        self.corpus = corpus
        if BM25Okapi is not None:
            tokenized_corpus = [tokenize(text) for _, text in self.corpus]
            self.bm25 = BM25Okapi(tokenized_corpus)
        else:
            self.bm25 = None

    def search(self, query: str, top_k: int = 3) -> list[RetrievedPassage]:
        if not self.bm25:
            return []
        
        tokenized_query = tokenize(query)
        scores = self.bm25.get_scores(tokenized_query)
        
        results = []
        for i, score in enumerate(scores):
            if score > 0:
                results.append(RetrievedPassage(
                    source=self.corpus[i][0],
                    text=self.corpus[i][1],
                    score=float(score)
                ))
                
        return sorted(results, key=lambda x: x.score, reverse=True)[:top_k]


class CrossEncoderReranker:
    """P005 - BGE Reranker"""
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        if CrossEncoder is not None:
            self.model = CrossEncoder(model_name, max_length=512)
        else:
            self.model = None

    def rerank(self, query: str, passages: list[RetrievedPassage]) -> list[RetrievedPassage]:
        if not self.model or not passages:
            return passages
            
        pairs = [[query, p.text] for p in passages]
        scores = self.model.predict(pairs)
        
        reranked = []
        for p, score in zip(passages, scores):
            reranked.append(RetrievedPassage(
                source=p.source,
                text=p.text,
                score=float(score)
            ))
            
        return sorted(reranked, key=lambda x: x.score, reverse=True)


class HybridRetriever:
    """Combines P003 (Dense), P004 (Sparse BM25), and P005 (Reranker)."""

    def __init__(self, corpus: list[tuple[str, str]] | None = None) -> None:
        self.corpus = corpus or SEED_CORPUS
        self.bm25_retriever = BM25Retriever(self.corpus)
        # We load the reranker lazily to save startup time
        self.reranker = None

    def _get_reranker(self):
        if self.reranker is None:
            # Using a tiny cross-encoder to prevent OOM on 6GB VRAM
            self.reranker = CrossEncoderReranker("cross-encoder/ms-marco-MiniLM-L-6-v2")
        return self.reranker

    def retrieve(self, claim: str, limit: int = 3) -> list[RetrievedPassage]:
        # 1. Sparse Retrieval (BM25)
        bm25_results = self.bm25_retriever.search(claim, top_k=limit*2)
        
        # 2. Dense Retrieval (Qdrant/BGE)
        dense_results = []
        client = get_qdrant()
        if client:
            model = get_model()
            vector = model.encode(claim).tolist()
            results = client.query_points(
                collection_name=settings.qdrant_collection,
                query=vector,
                limit=limit*2
            ).points
            for hit in results:
                payload = hit.payload or {}
                dense_results.append(RetrievedPassage(
                    source=payload.get("source", "Unknown"),
                    text=payload.get("text", ""),
                    score=hit.score
                ))

        # Combine unique passages
        seen = set()
        combined = []
        for p in bm25_results + dense_results:
            if p.text not in seen:
                seen.add(p.text)
                combined.append(p)
                
        # Fallback if no services are available
        if not combined:
            claim_terms = set(tokenize(claim))
            ranked = [RetrievedPassage(source, text, len(claim_terms & set(tokenize(text))) / max(1, len(claim_terms))) for source, text in self.corpus]
            combined = sorted(ranked, key=lambda passage: passage.score, reverse=True)[:limit]
            
        # 3. Reranking (BGE Reranker proxy)
        reranked = self._get_reranker().rerank(claim, combined)
        
        return reranked[:limit]

    @property
    def backend(self) -> str:
        return "bge-dense+bm25+cross-encoder" if settings.qdrant_url else "local-bm25+cross-encoder"
