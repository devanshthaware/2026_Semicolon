from __future__ import annotations

import json
from pathlib import Path

from app.config import settings


class FusionModel:
    """Loads a trained LightGBM/XGBoost artifact when present; explicit fallback otherwise."""

    def __init__(self) -> None:
        self.path = settings.fusion_model_path
        self.artifact: dict | None = None
        if self.path:
            self.artifact = json.loads(Path(self.path).read_text())

    def predict(self, features: dict[str, float | None]) -> float:
        if self.artifact:
            feature_names = self.artifact["featureNames"]
            if all(features.get(name) is not None for name in feature_names):
                logit = float(self.artifact["bias"])
                for name, weight in zip(feature_names, self.artifact["weights"]):
                    logit += float(weight) * float(features[name])
                return 1 / (1 + __import__("math").exp(-max(-20, min(20, logit))))
        available = [value for value in features.values() if value is not None]
        if not available:
            return 0.5
        # A transparent bootstrap baseline, not a replacement for the trained fusion model.
        weights = {"sep": 0.15, "semantic": 0.2, "kernel": 0.2, "grounding": 0.35, "retrieval": 0.1}
        numerator = sum(weights[name] * value for name, value in features.items() if value is not None)
        denominator = sum(weights[name] for name, value in features.items() if value is not None)
        return max(0.0, min(1.0, numerator / denominator))

    @property
    def backend(self) -> str:
        return self.artifact.get("artifactType", "trained-artifact") if self.artifact else "transparent-development-baseline"
