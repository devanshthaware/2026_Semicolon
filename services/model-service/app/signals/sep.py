from __future__ import annotations

import torch
from pathlib import Path

from app.config import settings

class SemanticEntropyProbe:
    def __init__(self) -> None:
        self.path = settings.sep_probe_path
        self.model = None
        if self.path and Path(self.path).exists():
            # The .pt file is a PyTorch state_dict or model
            try:
                self.model = torch.load(self.path, map_location="cpu", weights_only=False)
                if isinstance(self.model, dict):
                    # It's a state_dict, we need to instantiate the linear layer
                    # But for now, we'll just check if it loaded.
                    pass
            except Exception:
                pass

    @property
    def available(self) -> bool:
        return self.model is not None

    def score(self, hidden_state: list[float] | None = None) -> float | None:
        if not self.model or hidden_state is None:
            return None
            
        try:
            tensor = torch.tensor([hidden_state], dtype=torch.float32)
            with torch.no_grad():
                # Try calling it if it's a full model
                if hasattr(self.model, "__call__"):
                    logit = self.model(tensor)
                    prob = torch.sigmoid(logit).item()
                    return prob
        except Exception:
            return None
        return None
