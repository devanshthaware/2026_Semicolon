import os
import requests
from dataclasses import dataclass

@dataclass(frozen=True)
class NLIResult:
    relation: str
    confidence: float

class EntailmentModel:
    def __init__(self) -> None:
        self.url = os.getenv("MODEL_SERVICE_URL", "http://model-service:8001")

    def assess(self, claim: str, evidence: str, retrieval_score: float) -> NLIResult:
        res = requests.post(
            f"{self.url}/nli",
            json={"claim": claim, "evidence": evidence, "retrieval_score": retrieval_score}
        )
        res.raise_for_status()
        data = res.json()
        return NLIResult(relation=data["relation"], confidence=data["confidence"])
