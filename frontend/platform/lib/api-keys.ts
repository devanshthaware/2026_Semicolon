import { createHash, randomBytes } from "crypto";

export type NewApiKey = { secret: string; prefix: string; secretHash: string };

export function createApiKey(): NewApiKey {
  const token = randomBytes(24).toString("base64url");
  const secret = `tl_live_${token}`;
  return { secret, prefix: secret.slice(0, 13), secretHash: hashApiKey(secret) };
}

export function hashApiKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function getBearerToken(header: string | null) {
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
}
