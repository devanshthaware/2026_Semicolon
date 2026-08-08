import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { VerificationVerdict } from "@prisma/client";

export async function POST(request: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  const session = await auth();
  let orgId = session?.user?.activeOrgId;

  if (!orgId) {
    const defaultOrg = await db.organization.findFirst();
    if (defaultOrg) {
      orgId = defaultOrg.id;
    }
  }

  const { sessionId } = await context.params;
  const body = await request.json();
  const { response, trustScore, verdict, claims, receipt } = body;

  let prismaVerdict: VerificationVerdict = VerificationVerdict.REVIEW;
  if (verdict === 'verified' || verdict === 'GROUNDED') prismaVerdict = VerificationVerdict.GROUNDED;
  else if (verdict === 'failed' || verdict === 'FLAGGED' || verdict === 'CONTRADICTED') prismaVerdict = VerificationVerdict.FLAGGED;

  const existing = await db.verificationSession.findUnique({
    where: { externalId: sessionId }
  });

  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const updatedSession = await db.verificationSession.update({
    where: { externalId: sessionId },
    data: {
      response: response || existing.response,
      trust: trustScore !== undefined ? trustScore : 0.85,
      verdict: prismaVerdict,
      result: {
        claims: claims || [],
        receipt: receipt || null,
        events: [{ type: "verification.completed", timestamp: new Date().toISOString() }]
      }
    }
  });

  return NextResponse.json({
    success: true,
    sessionId: updatedSession.externalId,
    trustScore: updatedSession.trust,
    verdict: updatedSession.verdict
  });
}
