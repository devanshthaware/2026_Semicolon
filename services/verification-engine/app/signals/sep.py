from __future__ import annotations

import json
from pathlib import Path
from math import exp

from app.config import settings


class SemanticEntropyProbe:
    """Artifact-backed SEP boundary. Hidden states must be supplied by local inference.

    A score is never fabricated: unavailable probes return None, allowing the
    fusion layer to degrade gracefully for closed APIs.
    """

    def __init__(self) -> None:
        self.path = settings.sep_probe_path
        self.artifact: dict | None = json.loads(Path(self.path).read_text()) if self.path else None

    @property
    def available(self) -> bool:
        return self.artifact is not None

    def score(self, hidden_state: list[float] | None = None) -> float | None:
        if not self.artifact or hidden_state is None:
            return None
        weights = self.artifact.get("weights", [])
        if len(hidden_state) != len(weights):
            return None
        logit = float(self.artifact.get("bias", 0)) + sum(float(weight) * value for weight, value in zip(weights, hidden_state))
        return 1 / (1 + exp(-max(-20, min(20, logit))))
