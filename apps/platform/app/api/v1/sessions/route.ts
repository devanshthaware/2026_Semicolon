import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { listSessions } from "../../../../lib/sessions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.activeOrgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ sessions: await listSessions(session.user.activeOrgId) });
}
