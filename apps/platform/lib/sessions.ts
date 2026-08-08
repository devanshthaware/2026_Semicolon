import { db } from "./db";

export async function listSessions(organizationId?: string) {
  return db.verificationSession.findMany({
    where: organizationId ? { organizationId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, externalId: true, prompt: true, trust: true, verdict: true, createdAt: true, result: true }
  });
}
