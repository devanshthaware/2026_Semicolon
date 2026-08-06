"""Train versioned fusion and conformal artifacts from normalized benchmark rows.

SEP training additionally requires hidden-state tensors produced by a local
Llama/Qwen generation job; it is never faked from text-only data.
"""
from pathlib import Path
import json
import joblib
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import train_test_split

DATA = Path("data/real/features.jsonl")
OUT = Path("artifacts/real")
OUT.mkdir(parents=True, exist_ok=True)
rows = [json.loads(line) for line in DATA.read_text().splitlines()]
features = ["sep", "semantic", "kernel", "grounding", "retrieval"]
X, y = [[row["features"].get(name, 0.5) for name in features] for row in rows], [row["label"] for row in rows]
X_train, X_cal, y_train, y_cal = train_test_split(X, y, test_size=.2, random_state=42, stratify=y)
model = HistGradientBoostingClassifier(random_state=42).fit(X_train, y_train)
joblib.dump({"model": model, "features": features, "training_rows": len(X_train)}, OUT / "fusion.joblib")
probabilities = model.predict_proba(X_cal)
nonconformity = sorted(1 - probability[label] for probability, label in zip(probabilities, y_cal))
quantile = nonconformity[min(len(nonconformity) - 1, int((len(nonconformity) + 1) * .9) - 1)]
(OUT / "conformal.json").write_text(json.dumps({"targetCoverage": .9, "nonconformity_quantile": quantile, "calibrationRows": len(X_cal)}, indent=2))
print("Wrote real fusion and conformal artifacts. Train SEP separately from hidden-state tensors.")
