import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dataDirectory = resolve(root, "data", "synthetic");
const artifactDirectory = resolve(root, "artifacts");
mkdirSync(dataDirectory, { recursive: true });
mkdirSync(resolve(artifactDirectory, "fusion"), { recursive: true });
mkdirSync(resolve(artifactDirectory, "conformal"), { recursive: true });
mkdirSync(resolve(artifactDirectory, "sep"), { recursive: true });

let state = 20260806;
const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
const sigmoid = (value) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, value))));
const names = ["sep", "semantic", "kernel", "grounding", "retrieval"];
const truths = [0.82, 1.1, 0.95, 1.65, 0.7];

function sample(index) {
  const features = Object.fromEntries(names.map((name) => [name, 0.15 + random() * 0.83]));
  const latent = -2.5 + names.reduce((sum, name, i) => sum + truths[i] * features[name], 0) + (random() - 0.5) * 0.45;
  const probability = sigmoid(latent);
  const grounded = random() < probability ? 1 : 0;
  const claim = grounded ? `Synthetic grounded claim ${index}: source evidence aligns with the stated fact.` : `Synthetic uncertain claim ${index}: source evidence is incomplete or inconsistent.`;
  return { id: `syn_${String(index).padStart(4, "0")}`, claim, label: grounded, features, evidence: grounded ? "Synthetic source supports the claim." : "Synthetic source does not establish the claim." };
}

const records = Array.from({ length: 720 }, (_, index) => sample(index + 1));
const train = records.slice(0, 480);
const calibration = records.slice(480, 600);
const evaluation = records.slice(600);

function trainLogistic(examples, dimensions, featureValue) {
  const weights = Array(dimensions).fill(0);
  let bias = 0;
  for (let epoch = 0; epoch < 600; epoch += 1) {
    for (const row of examples) {
      const input = featureValue(row);
      const prediction = sigmoid(bias + input.reduce((sum, value, index) => sum + value * weights[index], 0));
      const error = row.label - prediction;
      const rate = 0.06 / (1 + epoch / 250);
      bias += rate * error;
      input.forEach((value, index) => { weights[index] += rate * error * value; });
    }
  }
  return { weights, bias };
}

const fusion = trainLogistic(train, names.length, (row) => names.map((name) => row.features[name]));
const predict = (row) => sigmoid(fusion.bias + names.reduce((sum, name, index) => sum + fusion.weights[index] * row.features[name], 0));
const accuracy = (rows) => rows.filter((row) => (predict(row) >= 0.5 ? 1 : 0) === row.label).length / rows.length;
const nonconformity = calibration.map((row) => row.label ? 1 - predict(row) : predict(row)).sort((left, right) => left - right);
const quantile = nonconformity[Math.min(nonconformity.length - 1, Math.ceil((nonconformity.length + 1) * 0.9) - 1)];

const sepRows = train.map((row) => ({ ...row, hidden: Array.from({ length: 6 }, (_, i) => (row.label ? 0.35 : -0.35) + (row.features[names[i % names.length]] - 0.5) + (random() - 0.5) * 0.25) }));
const sep = trainLogistic(sepRows, 6, (row) => row.hidden);

function jsonl(rows) { return `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`; }
writeFileSync(resolve(dataDirectory, "train.jsonl"), jsonl(train));
writeFileSync(resolve(dataDirectory, "calibration.jsonl"), jsonl(calibration));
writeFileSync(resolve(dataDirectory, "evaluation.jsonl"), jsonl(evaluation));
writeFileSync(resolve(artifactDirectory, "fusion", "synthetic-logistic-v1.json"), `${JSON.stringify({ artifactType: "synthetic-logistic-fusion", featureNames: names, ...fusion, training: { dataset: "data/synthetic/train.jsonl", examples: train.length, evaluationAccuracy: Number(accuracy(evaluation).toFixed(3)), warning: "Synthetic-only artifact. Do not use for production reliability claims." } }, null, 2)}\n`);
writeFileSync(resolve(artifactDirectory, "conformal", "synthetic-90-v1.json"), `${JSON.stringify({ artifactType: "split-conformal", targetCoverage: 0.9, nonconformity_quantile: Number(quantile.toFixed(5)), calibrationExamples: calibration.length, warning: "Synthetic-only calibration. Not a production coverage guarantee." }, null, 2)}\n`);
writeFileSync(resolve(artifactDirectory, "sep", "synthetic-linear-probe-v1.json"), `${JSON.stringify({ artifactType: "synthetic-semantic-entropy-probe", featureNames: Array.from({ length: 6 }, (_, index) => `hidden_${index}`), ...sep, training: { examples: sepRows.length, warning: "Synthetic-only SEP proof artifact; requires real local-model hidden states for deployment." } }, null, 2)}\n`);
writeFileSync(resolve(dataDirectory, "README.md"), "# Synthetic TruthLayer Dataset\n\nGenerated deterministically by `npm.cmd run artifacts:generate`. It contains synthetic claim labels and five engineered verification signals for pipeline, artifact, and notebook proof only. It is not valid for product metrics or calibrated production guarantees.\n");
console.log(`Generated ${records.length} synthetic records and fusion, conformal, and SEP proof artifacts.`);
