import os
import requests
from dataclasses import dataclass

@dataclass
class RetrievedPassage:
    text: str
    source: str
    score: float

def tokens(text: str) -> set[str]:
    # Basic helper retained for evidence_agent
    return set(text.lower().split())

class HybridRetriever:
    def __init__(self) -> None:
        self.url = os.getenv("RETRIEVAL_SERVICE_URL", "http://retrieval-service:8002")
        self._backend = "remote-retrieval-service"

    def search(self, query: str) -> list[RetrievedPassage]:
        res = requests.post(f"{self.url}/retrieve", json={"query": query})
        res.raise_for_status()
        data = res.json()
        self._backend = data.get("backend", self._backend)
        
        passages = []
        for p in data.get("passages", []):
            passages.append(RetrievedPassage(text=p["text"], source=p["source"], score=p["score"]))
        return passages

    @property
    def backend(self) -> str:
        return self._backend
