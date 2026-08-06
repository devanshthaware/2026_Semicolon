import { verify, type VerificationRequest, type VerificationResult } from "./verification";

/**
 * Keeps the public route stable while a separately deployed ML engine evolves.
 * Without TRUTHLAYER_ENGINE_URL, local development uses the documented fallback.
 */
export async function runVerification(request: VerificationRequest): Promise<VerificationResult> {
  const engineUrl = process.env.TRUTHLAYER_ENGINE_URL;
  if (!engineUrl) return verify(request);

  const response = await fetch(`${engineUrl.replace(/\/$/, "")}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    cache: "no-store"
  });

  if (!response.ok) throw new Error(`Verification engine returned ${response.status}`);
  return response.json() as Promise<VerificationResult>;
}
