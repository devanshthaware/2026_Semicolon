from __future__ import annotations

import pickle
from pathlib import Path

from app.config import settings

class ConformalCalibrator:
    def __init__(self) -> None:
        self.quantile: float | None = None
        if settings.conformal_calibration_path and Path(settings.conformal_calibration_path).exists():
            with open(settings.conformal_calibration_path, "rb") as f:
                data = pickle.load(f)
            self.quantile = float(data["nonconformity_quantile"])

    def interval(self, probability: float) -> tuple[float, float] | None:
        if self.quantile is None:
            return None
        return max(0.0, probability - self.quantile), min(1.0, probability + self.quantile)

    @property
    def calibrated(self) -> bool:
        return self.quantile is not None
