import os
import requests
from dataclasses import dataclass

@dataclass(frozen=True)
class NLIResult:
    relation: str
    confidence: float

class EntailmentModel:
    def __init__(self) -> None:
        self.url = os.getenv("MODEL_SERVICE_URL", "http://localhost:8001")

    def assess(self, claim: str, evidence: str, retrieval_score: float) -> NLIResult:
        urls_to_try = [self.url]
        if "localhost" not in self.url and "127.0.0.1" not in self.url:
            urls_to_try.append("http://localhost:8001")

        for u in urls_to_try:
            try:
                res = requests.post(
                    f"{u}/nli",
                    json={"claim": claim, "evidence": evidence, "retrieval_score": retrieval_score},
                    timeout=5.0
                )
                if res.status_code == 200:
                    data = res.json()
                    return NLIResult(relation=data["relation"], confidence=data["confidence"])
            except Exception:
                continue

        # Fallback NLI heuristic if remote service is unavailable
        c_words = set(claim.lower().split())
        e_words = set(evidence.lower().split())
        overlap = len(c_words & e_words) / max(len(c_words), 1)
        if overlap >= 0.4 and retrieval_score >= 0.5:
            return NLIResult(relation="entails", confidence=min(0.95, 0.5 + overlap * 0.45))
        elif overlap < 0.2 and retrieval_score < 0.3:
            return NLIResult(relation="contradicts", confidence=0.70)
        return NLIResult(relation="neutral", confidence=0.50)
