import type { VerificationResult } from "./verification";

export type SessionSummary = Pick<VerificationResult, "id" | "trust" | "verdict" | "receipt"> & { prompt: string; claimCount: number };

const sessions: SessionSummary[] = [];

export function addSession(result: VerificationResult, prompt: string) {
  sessions.unshift({ id: result.id, trust: result.trust, verdict: result.verdict, receipt: result.receipt, prompt, claimCount: result.claims.length });
  sessions.splice(12);
}

export function listSessions() {
  return sessions;
}
