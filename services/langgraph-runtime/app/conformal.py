import os
import requests
from typing import Optional, Tuple

class ConformalCalibrator:
    def __init__(self) -> None:
        self.url = os.getenv("MODEL_SERVICE_URL", "http://model-service:8001")
        self._calibrated = False

    def interval(self, probability: float) -> Optional[Tuple[float, float]]:
        res = requests.get(f"{self.url}/conformal", params={"probability": probability})
        res.raise_for_status()
        data = res.json()
        self._calibrated = data.get("calibrated", False)
        return data.get("interval")

    @property
    def calibrated(self) -> bool:
        return self._calibrated
