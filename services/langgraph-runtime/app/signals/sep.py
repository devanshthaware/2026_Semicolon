import os
import requests
from typing import Optional

class SemanticEntropyProbe:
    def __init__(self) -> None:
        self.url = os.getenv("MODEL_SERVICE_URL", "http://model-service:8001")
        self._available = False

    def score(self, hidden_state: Optional[list[float]] = None) -> Optional[float]:
        # The true implementation might take hidden_state, but our current mock doesn't
        res = requests.get(f"{self.url}/sep")
        res.raise_for_status()
        data = res.json()
        self._available = data.get("available", False)
        return data.get("score")

    @property
    def available(self) -> bool:
        return self._available
