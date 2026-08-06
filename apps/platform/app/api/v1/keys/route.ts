import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { createApiKey } from "../../../../lib/api-keys";
import { isBootstrapAuthorized } from "../../../../lib/api-auth";

function unauthorized() { return NextResponse.json({ error: "Bootstrap authorization required" }, { status: 401 }); }

export async function GET(request: NextRequest) {
  if (!isBootstrapAuthorized(request.headers.get("x-truthlayer-bootstrap-token"))) return unauthorized();
  const organizationId = request.nextUrl.searchParams.get("organizationId");
  if (!organizationId) return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
  const keys = await db.apiKey.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, prefix: true, status: true, createdAt: true, lastUsedAt: true, revokedAt: true } });
  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest) {
  if (!isBootstrapAuthorized(request.headers.get("x-truthlayer-bootstrap-token"))) return unauthorized();
  const body = await request.json() as { organizationId?: string; organizationName?: string; organizationSlug?: string; name?: string };
  let organizationId = body.organizationId;
  if (!organizationId) {
    if (!body.organizationName || !body.organizationSlug) return NextResponse.json({ error: "organizationId or organizationName + organizationSlug is required" }, { status: 400 });
    organizationId = (await db.organization.create({ data: { name: body.organizationName, slug: body.organizationSlug } })).id;
  }
  const generated = createApiKey();
  const apiKey = await db.apiKey.create({ data: { organizationId, name: body.name ?? "Production key", prefix: generated.prefix, secretHash: generated.secretHash } });
  return NextResponse.json({ id: apiKey.id, name: apiKey.name, prefix: apiKey.prefix, secret: generated.secret, organizationId }, { status: 201 });
}
