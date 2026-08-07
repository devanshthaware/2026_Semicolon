# Synthetic Artifacts and Reproducibility Proof

Run `npm.cmd run artifacts:generate` to deterministically create:

- `data/synthetic/train.jsonl`, `calibration.jsonl`, and `evaluation.jsonl`
- `artifacts/fusion/synthetic-logistic-v1.json`
- `artifacts/conformal/synthetic-90-v1.json`
- `artifacts/sep/synthetic-linear-probe-v1.json`

The generator genuinely fits linear logistic models and derives a split-conformal nonconformity quantile from the synthetic calibration split. The FastAPI engine can load these artifacts through the paths in Docker Compose.

This provides a reproducible engineering proof for artifact loading, feature order, fusion inference, calibration metadata, and receipt generation. It does **not** validate Argus’s research claims: synthetic data must never be used for production accuracy, AUROC, or coverage statements.

The executable notebook at `notebooks/argus_synthetic_proof.ipynb` verifies the generated files, recomputes linear predictions, and demonstrates semantic-entropy calculations.
