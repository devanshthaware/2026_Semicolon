import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listSessions } from "@/lib/sessions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.activeOrgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const sessions = await listSessions(session.user.activeOrgId);
  const mapped = sessions.map(s => {
    // Map verdict to frontend status
    const statusMap: Record<string, string> = { GROUNDED: 'verified', REVIEW: 'warning', FLAGGED: 'failed' };
    const status = statusMap[s.verdict] || 'warning';
    
    // Extract claims from result JSON if available
    const resultObj = s.result as any;
    const claims = resultObj?.claims || [];
    
    return {
      id: s.externalId || s.id,
      prompt: s.prompt,
      trust: s.trust,
      status,
      claims
    };
  });
  
  return NextResponse.json(mapped);
}
