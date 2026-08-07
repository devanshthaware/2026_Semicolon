from __future__ import annotations

import pickle
from pathlib import Path
import joblib

from app.config import settings

class FusionModel:
    def __init__(self) -> None:
        self.path = settings.fusion_model_path
        self.model = None
        if self.path and Path(self.path).exists():
            self.model = joblib.load(self.path)

    def predict(self, features: dict[str, float | None]) -> float:
        available = [value for value in features.values() if value is not None]
        if not available:
            return 0.5
            
        if self.model:
            # Assumes features are ordered correctly for the sklearn model:
            # ['sep', 'semantic', 'kernel', 'grounding', 'retrieval']
            # We map missing to 0.0 for simplicity if using sklearn.
            f_array = [[features.get("sep") or 0.0, 
                        features.get("semantic") or 0.0, 
                        features.get("kernel") or 0.0, 
                        features.get("grounding") or 0.0, 
                        features.get("retrieval") or 0.0]]
            # predict_proba returns [[prob_0, prob_1]]
            return float(self.model.predict_proba(f_array)[0][1])

        # A transparent bootstrap baseline, not a replacement for the trained fusion model.
        weights = {"sep": 0.15, "semantic": 0.2, "kernel": 0.2, "grounding": 0.35, "retrieval": 0.1}
        numerator = sum(weights[name] * value for name, value in features.items() if value is not None)
        denominator = sum(weights[name] for name, value in features.items() if value is not None)
        return max(0.0, min(1.0, numerator / denominator))

    @property
    def backend(self) -> str:
        return "sklearn-random-forest" if self.model else "transparent-development-baseline"
