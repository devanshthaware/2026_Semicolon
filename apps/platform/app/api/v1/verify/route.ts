import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { VerificationVerdict } from "@prisma/client";

export async function POST(request: NextRequest) {
  const session = await auth();
  let orgId = session?.user?.activeOrgId;

  if (!orgId) {
    // Fallback for demo playground access
    const defaultOrg = await db.organization.findFirst();
    if (defaultOrg) {
      orgId = defaultOrg.id;
    }
  }

  if (!orgId) {
    return NextResponse.json({ error: "No organization found" }, { status: 401 });
  }

  const body = await request.json();
  const { prompt, response } = body;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const externalId = `verif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Create real persisted VerificationSession in PostgreSQL
  const newSession = await db.verificationSession.create({
    data: {
      externalId,
      prompt,
      response: response || "",
      trust: 0.0,
      verdict: VerificationVerdict.REVIEW,
      result: {
        claims: [],
        events: [{ type: "verification.started", timestamp: new Date().toISOString() }]
      },
      organizationId: orgId
    }
  });

  return NextResponse.json({
    sessionId: newSession.externalId,
    dbId: newSession.id,
    status: "started"
  });
}
