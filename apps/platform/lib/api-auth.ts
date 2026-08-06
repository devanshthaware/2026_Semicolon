import { ApiKeyStatus } from "@prisma/client";
import { db } from "./db";
import { getBearerToken, hashApiKey } from "./api-keys";

export async function authenticateApiKey(authorization: string | null) {
  const secret = getBearerToken(authorization);
  if (!secret) return null;

  const key = await db.apiKey.findFirst({
    where: { secretHash: hashApiKey(secret), status: ApiKeyStatus.ACTIVE },
    select: { id: true, organizationId: true }
  });
  if (key) await db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return key;
}

export function isBootstrapAuthorized(value: string | null) {
  const expected = process.env.TRUTHLAYER_BOOTSTRAP_TOKEN;
  return Boolean(expected && value && value === expected);
}
