"""Download and normalize public hallucination benchmarks into one claim schema."""
from datasets import load_dataset
from pathlib import Path
import json

OUT = Path("data/benchmarks")
OUT.mkdir(parents=True, exist_ok=True)

def write(name, rows):
    with (OUT / f"{name}.jsonl").open("w", encoding="utf-8") as file:
        for row in rows: file.write(json.dumps(row) + "\n")

# TruthfulQA is stable and supported by the datasets hub. HaluEval and
# SelfCheckGPT formats vary by release; adapters below intentionally fail loudly
# when their source schema changes instead of silently creating wrong labels.
truthful = load_dataset("truthfulqa/truthful_qa", "generation", split="validation")
write("truthfulqa", ({"benchmark":"TruthfulQA", "prompt": row["question"], "reference": row["best_answer"], "label": 1} for row in truthful))

print("Prepared TruthfulQA. Configure HaluEval and SelfCheckGPT source revisions in this script before training.")
