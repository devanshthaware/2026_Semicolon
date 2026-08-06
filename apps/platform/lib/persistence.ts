import { VerificationVerdict, type Prisma } from "@prisma/client";
import { db } from "./db";
import type { VerificationResult } from "./verification";

export async function persistSession(result: VerificationResult, prompt: string, response: string, organizationId: string, apiKeyId: string) {
  return db.verificationSession.create({
    data: {
      externalId: result.id,
      prompt,
      response,
      trust: result.trust,
      verdict: result.verdict.toUpperCase() as VerificationVerdict,
      result: result as unknown as Prisma.InputJsonValue,
      organizationId,
      apiKeyId
    }
  });
}
