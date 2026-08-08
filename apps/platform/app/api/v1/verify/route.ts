import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { VerificationVerdict } from "@prisma/client";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.activeOrgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      organizationId: session.user.activeOrgId
    }
  });

  return NextResponse.json({
    sessionId: newSession.externalId,
    dbId: newSession.id,
    status: "started"
  });
}
