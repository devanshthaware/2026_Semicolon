import os
import requests
from typing import Optional, Tuple

class ConformalCalibrator:
    def __init__(self) -> None:
        self.url = os.getenv("MODEL_SERVICE_URL", "http://localhost:8001")
        self._calibrated = False

    def interval(self, probability: float) -> Optional[Tuple[float, float]]:
        # Try both env URL and localhost fallback
        urls_to_try = [self.url]
        if "localhost" not in self.url and "127.0.0.1" not in self.url:
            urls_to_try.append("http://localhost:8001")

        for u in urls_to_try:
            try:
                res = requests.get(f"{u}/conformal", params={"probability": probability}, timeout=3.0)
                if res.status_code == 200:
                    data = res.json()
                    self._calibrated = data.get("calibrated", False)
                    return data.get("interval")
            except Exception:
                continue

        self._calibrated = False
        return None

    @property
    def calibrated(self) -> bool:
        return self._calibrated
