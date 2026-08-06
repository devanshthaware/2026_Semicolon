export type Verdict = "grounded" | "review" | "flagged";

export type VerificationRequest = {
  input?: string;
  response?: string;
  mode?: "standard" | "strict";
};

export type VerificationResult = {
  id: string;
  trust: number;
  verdict: Verdict;
  claims: Array<{
    id: string;
    text: string;
    trust: number;
    verdict: Verdict;
    evidence: Array<{ source: string; snippet: string; relation: "entails" | "neutral" | "contradicts" }>;
  }>;
  layers: {
    semanticEntropyProbe: number;
    semanticEntropy: number;
    kernelLanguageEntropy: number;
    retrievalGroundedEntailment: number;
  };
  receipt: { issuedAt: string; mode: "standard" | "strict"; version: string };
};

const knownFacts: Array<{ pattern: RegExp; source: string; snippet: string }> = [
  { pattern: /paris.{0,60}capital.{0,60}france|capital.{0,60}france.{0,60}paris/i, source: "Reference knowledge", snippet: "Paris is the capital and most populous city of France." },
  { pattern: /eiffel tower/i, source: "Reference knowledge", snippet: "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris." },
  { pattern: /water.{0,30}(100|one hundred).{0,30}celsius|100.{0,30}celsius.{0,30}water/i, source: "Reference knowledge", snippet: "At standard atmospheric pressure, pure water boils at 100 °C." }
];

function classify(trust: number): Verdict {
  return trust >= 0.82 ? "grounded" : trust >= 0.56 ? "review" : "flagged";
}

function sentenceClaims(text: string) {
  return text.split(/(?<=[.!?])\s+/).map((claim) => claim.trim()).filter(Boolean).slice(0, 6);
}

/**
 * Development-only implementation. This is the narrow seam where the future
 * retrieval/NLI, entropy, fusion, and conformal services plug into the API.
 */
export function verify(request: VerificationRequest): VerificationResult {
  const mode = request.mode ?? "standard";
  const claims = sentenceClaims(request.response ?? "").map((text, index) => {
    const match = knownFacts.find((fact) => fact.pattern.test(text));
    const hedged = /\b(may|might|could|uncertain|estimate)\b/i.test(text);
    const unsupportedSpecific = /\b\d{3,}\b/.test(text) && !match;
    const trust = match ? 0.94 : unsupportedSpecific ? 0.48 : hedged ? 0.67 : 0.74;
    return {
      id: `clm_${index + 1}`,
      text,
      trust,
      verdict: classify(trust),
      evidence: [{ source: match?.source ?? "Retrieval pending", snippet: match?.snippet ?? "No indexed evidence is connected in development mode.", relation: (match ? "entails" : "neutral") as "entails" | "neutral" }]
    };
  });
  const meanTrust = claims.reduce((sum, claim) => sum + claim.trust, 0) / claims.length;
  const trust = Math.max(0, meanTrust + (mode === "strict" ? -0.04 : 0));

  return {
    id: `vrf_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    trust,
    verdict: classify(trust),
    claims,
    layers: {
      semanticEntropyProbe: Math.min(0.96, trust + 0.02),
      semanticEntropy: Math.min(0.94, trust),
      kernelLanguageEntropy: Math.min(0.92, trust - 0.02),
      retrievalGroundedEntailment: Math.min(0.97, trust + 0.04)
    },
    receipt: { issuedAt: new Date().toISOString(), mode, version: "0.1.0-dev" }
  };
}
