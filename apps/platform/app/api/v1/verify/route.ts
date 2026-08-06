import { NextRequest, NextResponse } from "next/server";
import { addSession } from "../../../../lib/sessions";
import { runVerification } from "../../../../lib/engine";
import { authenticateApiKey } from "../../../../lib/api-auth";
import { persistSession } from "../../../../lib/persistence";

export async function POST(request: NextRequest) {
  const body = await request.json() as { input?: string; response?: string; mode?: "standard" | "strict" };
  if (!body.response?.trim()) return NextResponse.json({ error: "response is required" }, { status: 400 });

  const apiKey = await authenticateApiKey(request.headers.get("authorization"));
  if (request.headers.has("authorization") && !apiKey) return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  const payload = await runVerification(body);
  addSession(payload, body.input ?? "Untitled prompt");
  if (apiKey) await persistSession(payload, body.input ?? "Untitled prompt", body.response, apiKey.organizationId, apiKey.id);
  return NextResponse.json(payload, { headers: { "Access-Control-Allow-Origin": "http://localhost:3001" } });
}

export async function OPTIONS() { return new NextResponse(null, { headers: { "Access-Control-Allow-Origin": "http://localhost:3001", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" } }); }
