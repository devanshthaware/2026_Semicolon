import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const sessions = await db.verificationSession.findMany({
      include: {
        organization: {
          select: {
            name: true,
            members: {
              include: { user: { select: { email: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      externalId: s.externalId,
      user: s.organization.members[0]?.user?.email || s.organization.name,
      prompt: s.prompt,
      verdict: s.verdict,
      trust: s.trust,
      createdAt: s.createdAt
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch verification stream" }, { status: 500 });
  }
}
