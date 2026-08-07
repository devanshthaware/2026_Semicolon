from __future__ import annotations

import json
from pathlib import Path
import pytest
from app.models.registry import ModelRegistry
from app.signals.sep import SemanticEntropyProbe

def test_model_registry_profiles():
    registry = ModelRegistry("laptop")
    assert registry.get_role("embedding").name == "BAAI/bge-large-en-v1.5"
    assert registry.get_role("small_generator").dimension == 1536
    prov = registry.get_provenance()
    assert prov["profile"] == "laptop"

def test_sep_probe_dimension_mismatch(tmp_path: Path):
    probe_file = tmp_path / "probe.json"
    probe_file.write_text(json.dumps({"weights": [0.1, 0.2, 0.3], "bias": 0.0}))
    probe = SemanticEntropyProbe()
    probe.path = str(probe_file)
    probe.artifact = json.loads(probe_file.read_text())
    
    # 5D hidden state vs 3D probe -> must reject/return None gracefully
    assert probe.score([0.1, 0.2, 0.3, 0.4, 0.5]) is None
    # Matching 3D -> returns score float
    assert probe.score([0.1, 0.2, 0.3]) is not None
