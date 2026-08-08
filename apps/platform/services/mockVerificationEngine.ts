export type LayerStatus = 'WAITING' | 'RUNNING' | 'COMPLETED' | 'SKIPPED' | 'TRIGGERED' | 'FAILED' | 'NOT APPLICABLE';
export type VerificationResult = 'SUPPORTED' | 'CONTRADICTED' | 'UNCERTAINTY DISCLOSED' | 'FLAGGED' | 'UNCERTAIN' | 'BORDERLINE' | 'CRITIC FLAGGED CLAIM' | 'PASS';

export interface VerificationLayer {
  id: string;
  name: string;
  status: LayerStatus;
  result?: VerificationResult;
  score?: number | string;
  details?: string;
  isVisible: boolean; // affected by ablation
}

export interface Claim {
  id: string;
  text: string;
  originalText: string;
  type: 'FACTUAL' | 'NUMERIC' | 'TEMPORAL';
  confidence: number;
  status: VerificationResult;
  layers: VerificationLayer[];
  evidence?: {
    source: string;
    published: string;
    relevantPassage: string;
  };
  signals: Record<string, string | number>;
  finalVerdict: VerificationResult;
  correctionAttempt1?: string;
  correctionAttempt2?: string;
  finalClaimText: string;
}

export interface VerificationReceipt {
  receiptId: string;
  sessionId: string;
  timestamp: string;
  claimsCount: number;
  evidenceHashes: string[];
  layersExecuted: string[];
  trustScore: number;
  confidenceInterval: string;
  pipelineVersion: string;
  manifestHash: string;
  signature: string;
  status: 'VALID' | 'INVALID';
}

export interface VerificationScenario {
  id: string;
  name: string;
  description: string;
  prompt: string;
  mockResponseText: string;
  claims: Claim[];
  rawTrust: number;
  finalTrust: number;
  confidenceInterval: string;
  evidenceCoverage: number;
  timeline: { timeMs: number; event: string }[];
  receipt: VerificationReceipt;
  // What changes when a layer is ablated
  ablationOverrides: Record<string, Partial<VerificationScenario>>;
}

export const SCENARIOS: Record<string, VerificationScenario> = {
  'math-error': {
    id: 'math-error',
    name: 'Math Error',
    description: 'Fluent mathematical error caught by symbolic verification.',
    prompt: 'Acme revenue increased from $1.8B to $2.3B, which is 47% growth. Is this correct?',
    mockResponseText: 'Yes. Revenue increased 47%.',
    claims: [
      {
        id: 'c1',
        text: 'Revenue increased 47%.',
        originalText: 'Revenue increased 47%.',
        type: 'NUMERIC',
        confidence: 0.95,
        status: 'CONTRADICTED',
        layers: [
          { id: 'semantic', name: 'Semantic Entropy', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', score: 'LOW' },
          { id: 'retrieval', name: 'Retrieval', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', score: 0.94 },
          { id: 'nli', name: 'NLI', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', details: 'ENTAILMENT' },
          { id: 'symbolic', name: 'Symbolic Verification', status: 'TRIGGERED', isVisible: true, result: 'CONTRADICTED', details: '1.8 × 1.47 = 2.646. Claimed: 2.3. ARITHMETIC CONTRADICTION.' },
        ],
        evidence: {
          source: 'Acme Q3 Financial Report',
          published: '2025-10-15',
          relevantPassage: 'Revenue increased from $1.8B to $2.3B.',
        },
        signals: {
          Semantic: 0.88,
          Retrieval: 0.95,
          NLI: 0.97,
          Symbolic: 0.20,
        },
        finalVerdict: 'PASS',
        correctionAttempt1: 'Revenue increased approximately 27.8%.',
        finalClaimText: 'Revenue increased approximately 27.8%.',
      }
    ],
    rawTrust: 0.61,
    finalTrust: 0.68,
    confidenceInterval: '64%–72%',
    evidenceCoverage: 0.91,
    timeline: [
      { timeMs: 0, event: 'Prompt received' },
      { timeMs: 250, event: 'Response generated' },
      { timeMs: 500, event: 'Claims extracted' },
      { timeMs: 700, event: 'Claim classification' },
      { timeMs: 900, event: 'Retrieval' },
      { timeMs: 1200, event: 'NLI' },
      { timeMs: 1400, event: 'Symbolic' },
      { timeMs: 1600, event: 'Correction' },
      { timeMs: 1900, event: 'Reverification' },
      { timeMs: 2200, event: 'Fusion' },
      { timeMs: 2400, event: 'Calibration' },
      { timeMs: 2600, event: 'Receipt' },
    ],
    receipt: {
      receiptId: 'rcpt_8f92jkl',
      sessionId: 'sess_12345',
      timestamp: new Date().toISOString(),
      claimsCount: 1,
      evidenceHashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
      layersExecuted: ['semantic', 'retrieval', 'nli', 'symbolic', 'correction', 'reverification'],
      trustScore: 68,
      confidenceInterval: '64%–72%',
      pipelineVersion: 'Demo-v1',
      manifestHash: 'sha256:d8a2bc4...9f01',
      signature: 'sig_a91b...f221',
      status: 'VALID',
    },
    ablationOverrides: {
      'symbolic': {
        finalTrust: 0.95,
        claims: [
          {
            id: 'c1',
            text: 'Revenue increased 47%.',
            originalText: 'Revenue increased 47%.',
            type: 'NUMERIC',
            confidence: 0.95,
            status: 'FLAGGED',
            layers: [
              { id: 'semantic', name: 'Semantic Entropy', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', score: 'LOW' },
              { id: 'retrieval', name: 'Retrieval', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', score: 0.94 },
              { id: 'nli', name: 'NLI', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', details: 'ENTAILMENT' },
              { id: 'symbolic', name: 'Symbolic Verification', status: 'SKIPPED', isVisible: false },
            ],
            evidence: {
              source: 'Acme Q3 Financial Report',
              published: '2025-10-15',
              relevantPassage: 'Revenue increased from $1.8B to $2.3B.',
            },
            signals: {
              Semantic: 0.88,
              Retrieval: 0.95,
              NLI: 0.97,
            },
            finalVerdict: 'SUPPORTED',
            finalClaimText: 'Revenue increased 47%.',
          }
        ]
      }
    }
  },
  'detect-correct': {
    id: 'detect-correct',
    name: 'Detect → Correct → Reverify',
    description: 'Demonstrates active correction of an arithmetic error.',
    prompt: 'Did Acme\'s revenue grow 47%?',
    mockResponseText: 'Yes, revenue grew 47%.',
    claims: [
      {
        id: 'c1',
        text: 'Revenue grew 47%.',
        originalText: 'Revenue grew 47%.',
        type: 'NUMERIC',
        confidence: 0.9,
        status: 'CONTRADICTED',
        layers: [
          { id: 'semantic', name: 'Semantic Entropy', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', score: 'LOW' },
          { id: 'symbolic', name: 'Symbolic Verification', status: 'TRIGGERED', isVisible: true, result: 'CONTRADICTED', details: 'Arithmetic contradiction detected in starting vs ending values.' },
        ],
        evidence: {
          source: 'Acme Q3 Financial Report',
          published: '2025-10-15',
          relevantPassage: 'Revenue increased from $1.8B to $2.3B.',
        },
        signals: {
          Semantic: 0.91,
          Symbolic: 0.15,
        },
        finalVerdict: 'PASS',
        correctionAttempt1: 'Revenue grew approximately 27.8%.',
        finalClaimText: 'Revenue grew approximately 27.8%.',
      }
    ],
    rawTrust: 0.65,
    finalTrust: 0.71,
    confidenceInterval: '68%–75%',
    evidenceCoverage: 0.90,
    timeline: [
      { timeMs: 0, event: 'Prompt received' },
      { timeMs: 300, event: 'Response generated' },
      { timeMs: 600, event: 'Claims extracted' },
      { timeMs: 1000, event: 'Symbolic verification' },
      { timeMs: 1500, event: 'Correction' },
      { timeMs: 1900, event: 'Reverification' },
      { timeMs: 2500, event: 'Receipt' },
    ],
    receipt: {
      receiptId: 'rcpt_a91bx',
      sessionId: 'sess_99912',
      timestamp: new Date().toISOString(),
      claimsCount: 1,
      evidenceHashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
      layersExecuted: ['semantic', 'symbolic', 'correction', 'reverification'],
      trustScore: 71,
      confidenceInterval: '68%–75%',
      pipelineVersion: 'Demo-v1',
      manifestHash: 'sha256:d8a2bc4...9f01',
      signature: 'sig_b22c...a110',
      status: 'VALID',
    },
    ablationOverrides: {}
  },
  'stale-evidence': {
    id: 'stale-evidence',
    name: 'Stale Evidence',
    description: 'Evidence supports the claim historically, but fails temporal validity.',
    prompt: 'Who is Acme\'s current CEO?',
    mockResponseText: 'Jane Whitfield is the current CEO.',
    claims: [
      {
        id: 'c1',
        text: 'Jane Whitfield is the current CEO.',
        originalText: 'Jane Whitfield is the current CEO.',
        type: 'TEMPORAL',
        confidence: 0.92,
        status: 'UNCERTAIN',
        layers: [
          { id: 'retrieval', name: 'Retrieval', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', score: 0.96 },
          { id: 'temporal', name: 'Temporal Validity', status: 'TRIGGERED', isVisible: true, result: 'FLAGGED', details: 'Evidence is from 2023. Current reference date: 2026. STALE EVIDENCE.' },
        ],
        evidence: {
          source: 'Acme 2023 Annual Report',
          published: '2023-01-10',
          relevantPassage: 'Jane Whitfield appointed as CEO.',
        },
        signals: {
          Retrieval: 0.96,
          Temporal: 0.40,
        },
        finalVerdict: 'UNCERTAIN',
        finalClaimText: 'Jane Whitfield is the current CEO.',
      }
    ],
    rawTrust: 0.55,
    finalTrust: 0.60,
    confidenceInterval: '55%–65%',
    evidenceCoverage: 0.85,
    timeline: [
      { timeMs: 0, event: 'Prompt received' },
      { timeMs: 300, event: 'Response generated' },
      { timeMs: 600, event: 'Claims extracted' },
      { timeMs: 900, event: 'Retrieval' },
      { timeMs: 1400, event: 'Temporal check' },
      { timeMs: 2000, event: 'Receipt' },
    ],
    receipt: {
      receiptId: 'rcpt_c33da',
      sessionId: 'sess_88123',
      timestamp: new Date().toISOString(),
      claimsCount: 1,
      evidenceHashes: ['a1b2c3d4...'],
      layersExecuted: ['retrieval', 'temporal'],
      trustScore: 60,
      confidenceInterval: '55%–65%',
      pipelineVersion: 'Demo-v1',
      manifestHash: 'sha256:d8a2bc4...9f01',
      signature: 'sig_c33d...b112',
      status: 'VALID',
    },
    ablationOverrides: {
      'temporal': {
        finalTrust: 0.93,
        claims: [
          {
            id: 'c1',
            text: 'Jane Whitfield is the current CEO.',
            originalText: 'Jane Whitfield is the current CEO.',
            type: 'TEMPORAL',
            confidence: 0.92,
            status: 'SUPPORTED',
            layers: [
              { id: 'retrieval', name: 'Retrieval', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', score: 0.96 },
              { id: 'temporal', name: 'Temporal Validity', status: 'SKIPPED', isVisible: false },
            ],
            evidence: {
              source: 'Acme 2023 Annual Report',
              published: '2023-01-10',
              relevantPassage: 'Jane Whitfield appointed as CEO.',
            },
            signals: {
              Retrieval: 0.96,
            },
            finalVerdict: 'SUPPORTED',
            finalClaimText: 'Jane Whitfield is the current CEO.',
          }
        ]
      }
    }
  },
  'confidently-wrong': {
    id: 'confidently-wrong',
    name: 'Confidently Wrong',
    description: 'Semantic entropy indicates confidence, but retrieval and cross-model disagree.',
    prompt: 'Who founded Acme in 2018?',
    mockResponseText: 'Acme was founded by John Carter in 2018.',
    claims: [
      {
        id: 'c1',
        text: 'Acme was founded by John Carter in 2018.',
        originalText: 'Acme was founded by John Carter in 2018.',
        type: 'FACTUAL',
        confidence: 0.99,
        status: 'FLAGGED',
        layers: [
          { id: 'semantic', name: 'Semantic Entropy', status: 'COMPLETED', isVisible: true, result: 'SUPPORTED', score: 'LOW' },
          { id: 'retrieval', name: 'Retrieval', status: 'COMPLETED', isVisible: true, result: 'FLAGGED', score: 0.40, details: 'WEAK / conflicting evidence' },
          { id: 'cross-model', name: 'Cross-Model Agreement', status: 'TRIGGERED', isVisible: true, result: 'FLAGGED', details: 'DISAGREEMENT: Gemma says Robert Chen' },
        ],
        evidence: {
          source: 'Generic Web Search',
          published: '2024-01-01',
          relevantPassage: 'No clear record of John Carter founding Acme.',
        },
        signals: {
          Semantic: 0.95,
          Retrieval: 0.40,
          Agreement: 0.25,
        },
        finalVerdict: 'FLAGGED',
        finalClaimText: 'Acme was founded by John Carter in 2018.',
      }
    ],
    rawTrust: 0.45,
    finalTrust: 0.48,
    confidenceInterval: '40%–55%',
    evidenceCoverage: 0.35,
    timeline: [
      { timeMs: 0, event: 'Prompt received' },
      { timeMs: 300, event: 'Response generated' },
      { timeMs: 600, event: 'Semantic check' },
      { timeMs: 900, event: 'Retrieval' },
      { timeMs: 1400, event: 'Cross-Model check' },
      { timeMs: 2000, event: 'Receipt' },
    ],
    receipt: {
      receiptId: 'rcpt_d44e',
      sessionId: 'sess_77112',
      timestamp: new Date().toISOString(),
      claimsCount: 1,
      evidenceHashes: ['b2c3d4e5...'],
      layersExecuted: ['semantic', 'retrieval', 'cross-model'],
      trustScore: 48,
      confidenceInterval: '40%–55%',
      pipelineVersion: 'Demo-v1',
      manifestHash: 'sha256:d8a2bc4...9f01',
      signature: 'sig_d44e...c223',
      status: 'VALID',
    },
    ablationOverrides: {}
  }
};

export const DEFAULT_SCENARIO = SCENARIOS['math-error'];

export const applyAblation = (scenario: VerificationScenario, disabledLayers: string[]): VerificationScenario => {
  let result = { ...scenario };
  for (const layer of disabledLayers) {
    if (result.ablationOverrides?.[layer]) {
      result = { ...result, ...result.ablationOverrides[layer] };
    }
  }
  return result;
};

// --- C2PA Cryptographic Receipt Generation ---

import CryptoJS from 'crypto-js';
import * as jose from 'jose';

let keyPair: jose.GenerateKeyPairResult | null = null;

export const initCrypto = async () => {
  if (!keyPair) {
    keyPair = await jose.generateKeyPair('ES256');
  }
};

export const generateDynamicReceipt = async (scenario: VerificationScenario): Promise<VerificationScenario> => {
  try {
    await initCrypto();
    
    // Create a payload from the scenario's verification results
    const payload = JSON.stringify({
      scenarioId: scenario.id,
      claimsCount: scenario.claims.length,
      finalTrust: scenario.finalTrust,
      claims: scenario.claims.map(c => ({
        id: c.id,
        verdict: c.finalVerdict,
        text: c.finalClaimText
      }))
    });

    // 1. Generate Manifest Hash (SHA-256)
    const hash = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
    const manifestHash = `sha256:${hash}`;

    // 2. Generate ECDSA Signature over the hash
    const signature = await new jose.CompactSign(new TextEncoder().encode(manifestHash))
      .setProtectedHeader({ alg: 'ES256' })
      .sign(keyPair!.privateKey);

    return {
      ...scenario,
      receipt: {
        ...scenario.receipt,
        timestamp: new Date().toISOString(),
        manifestHash,
        signature
      }
    };
  } catch (error) {
    console.error("Failed to generate dynamic receipt:", error);
    return scenario;
  }
};
