export type VerificationMode = "standard" | "strict";

export type VerifyRequest = {
  input: string;
  response: string;
  mode?: VerificationMode;
  /** Optional alternate generations for semantic-entropy and KLE analysis. */
  samples?: string[];
};

export type LayerScores = {
  semanticEntropyProbe: number;
  semanticEntropy: number;
  kernelLanguageEntropy: number;
  retrievalGroundedEntailment: number;
};

export type ClaimResult = {
  id: string;
  text: string;
  verdict: "grounded" | "review" | "flagged";
  trust: number;
  evidence: Array<{ source: string; snippet: string; relation: "entails" | "neutral" | "contradicts"; retrieval_score?: number; entailment_score?: number }>;
  diagnostics?: Record<string, number | string | null>;
};

export type VerifyResult = {
  id: string;
  trust: number;
  verdict: "grounded" | "review" | "flagged";
  claims: ClaimResult[];
  layers: LayerScores;
  receipt: { issuedAt: string; mode: VerificationMode; version: string; conformalLower?: number | string; conformalUpper?: number | string };
  diagnostics?: Record<string, boolean | number | string | null>;
};

export class TruthLayerError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "TruthLayerError";
  }
}

export class TruthLayer {
  constructor(private readonly options: { baseUrl: string; apiKey?: string }) {}

  async verify(request: VerifyRequest): Promise<VerifyResult> {
    const response = await fetch(`${this.options.baseUrl.replace(/\/$/, "")}/api/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.options.apiKey ? { Authorization: `Bearer ${this.options.apiKey}` } : {})
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new TruthLayerError("Verification request failed", response.status);
    }

    return response.json() as Promise<VerifyResult>;
  }
}
