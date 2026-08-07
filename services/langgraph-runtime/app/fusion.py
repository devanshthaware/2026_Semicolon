import os
import requests
from typing import Dict, Optional

class FusionModel:
    def __init__(self) -> None:
        self.url = os.getenv("MODEL_SERVICE_URL", "http://model-service:8001")
        self._backend = "remote-model-service"

    def predict(self, features: Dict[str, Optional[float]]) -> float:
        res = requests.post(f"{self.url}/fusion", json={"features": features})
        res.raise_for_status()
        data = res.json()
        self._backend = data.get("backend", self._backend)
        return data["score"]

    @property
    def backend(self) -> str:
        return self._backend
