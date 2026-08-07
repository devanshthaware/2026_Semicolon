import { NextRequest, NextResponse } from "next/server";
import { VerificationVerdict, type Prisma } from "@prisma/client";
import { auth } from "../../../../auth";
import { db } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  const orgId = session?.user?.activeOrgId ?? "dev-default-org";
  const body = await request.json() as { input?: string; response?: string; mode?: "standard" | "strict"; samples?: string[] };
  if (!body.response?.trim()) return NextResponse.json({ error: "response is required" }, { status: 400 });

  const engineUrl = process.env.VERIFICATION_ENGINE_URL ?? "http://localhost:8000";
  const engineResponse = await fetch(`${engineUrl}/v1/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: body.input ?? "", response: body.response, mode: body.mode ?? "standard", samples: body.samples }) });
  if (!engineResponse.ok) return NextResponse.json({ error: await engineResponse.text() || "Verification engine failed" }, { status: 502 });

  const result = await engineResponse.json() as { id: string; trust: number; verdict: "grounded" | "review" | "flagged" };
  try {
    await db.verificationSession.create({ data: { externalId: result.id, prompt: body.input ?? "", response: body.response, trust: result.trust, verdict: result.verdict.toUpperCase() as VerificationVerdict, result: result as Prisma.InputJsonValue, organizationId: orgId } });
  } catch (e) {
    // Ignore database session creation error in dev mode when org does not exist
  }
  return NextResponse.json(result, { status: 201 });
}
