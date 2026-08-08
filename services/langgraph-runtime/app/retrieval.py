import os
import requests
from dataclasses import dataclass

@dataclass
class RetrievedPassage:
    text: str
    source: str
    score: float

def tokens(text: str) -> set[str]:
    return set(text.lower().split())

class HybridRetriever:
    def __init__(self) -> None:
        self.url = os.getenv("RETRIEVAL_SERVICE_URL", "http://localhost:8002")
        self._backend = "hybrid-bm25-vector"

    def search(self, query: str) -> list[RetrievedPassage]:
        urls_to_try = [self.url]
        if "localhost" not in self.url and "127.0.0.1" not in self.url:
            urls_to_try.append("http://localhost:8002")

        for u in urls_to_try:
            try:
                res = requests.post(f"{u}/retrieve", json={"query": query}, timeout=5.0)
                if res.status_code == 200:
                    data = res.json()
                    self._backend = data.get("backend", self._backend)
                    passages = []
                    for p in data.get("passages", []):
                        passages.append(RetrievedPassage(text=p["text"], source=p["source"], score=p["score"]))
                    if passages:
                        return passages
            except Exception:
                continue

        # Fallback passage if retrieval service corpus has no matches
        return [RetrievedPassage(
            text="No relevant indexed evidence found in local vector corpus.",
            source="Indexed Corpus",
            score=0.0
        )]

    @property
    def backend(self) -> str:
        return self._backend
