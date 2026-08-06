import { NextRequest, NextResponse } from "next/server";
import { ApiKeyStatus } from "@prisma/client";
import { db } from "../../../../../lib/db";
import { isBootstrapAuthorized } from "../../../../../lib/api-auth";

export async function DELETE(request: NextRequest, context: { params: Promise<{ keyId: string }> }) {
  if (!isBootstrapAuthorized(request.headers.get("x-truthlayer-bootstrap-token"))) return NextResponse.json({ error: "Bootstrap authorization required" }, { status: 401 });
  const { keyId } = await context.params;
  await db.apiKey.update({ where: { id: keyId }, data: { status: ApiKeyStatus.REVOKED, revokedAt: new Date() } });
  return new NextResponse(null, { status: 204 });
}
