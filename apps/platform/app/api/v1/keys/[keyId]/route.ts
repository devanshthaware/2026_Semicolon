import { NextRequest, NextResponse } from "next/server";
import { ApiKeyStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { isBootstrapAuthorized } from "@/lib/api-auth";
import { auth } from "@/auth";

export async function DELETE(request: NextRequest, context: { params: Promise<{ keyId: string }> }) {
  const session = await auth();
  const isBootstrap = isBootstrapAuthorized(request.headers.get("x-argus-bootstrap-token"));
  
  if (!session?.user?.activeOrgId && !isBootstrap) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { keyId } = await context.params;

  // Find key to ensure it belongs to the user's org if not bootstrap
  const existingKey = await db.apiKey.findUnique({ where: { id: keyId } });
  if (!existingKey) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  if (!isBootstrap && existingKey.organizationId !== session?.user?.activeOrgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Revoke/Delete
  await db.apiKey.update({
    where: { id: keyId },
    data: { status: ApiKeyStatus.REVOKED, revokedAt: new Date() }
  });

  return NextResponse.json({ success: true, message: "Key revoked successfully" });
}
