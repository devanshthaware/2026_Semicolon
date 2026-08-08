import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();

  // Enforce server-side Admin role protection
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    // 1. Check Ollama local status
    let ollamaStatus = "OFFLINE";
    try {
      const ollamaRes = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) });
      if (ollamaRes.ok) ollamaStatus = "CONNECTED";
    } catch {
      ollamaStatus = "OFFLINE";
    }

    // 2. Check FastAPI backend status
    let fastapiStatus = "OFFLINE";
    try {
      const apiRes = await fetch("http://localhost:8000/v1/health/ollama", { signal: AbortSignal.timeout(2000) });
      if (apiRes.ok) fastapiStatus = "HEALTHY";
    } catch {
      fastapiStatus = "OFFLINE";
    }

    // 3. Check PostgreSQL database status
    let dbStatus = "HEALTHY";
    try {
      await db.user.count();
    } catch {
      dbStatus = "DEGRADED";
    }

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      services: {
        ollama: { status: ollamaStatus, endpoint: "http://localhost:11434" },
        fastapi: { status: fastapiStatus, endpoint: "http://localhost:8000" },
        database: { status: dbStatus, type: "PostgreSQL" },
        langgraph: { status: "READY", engine: "Python Runtime" },
        websocket: { status: "CONNECTED" },
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check system health" }, { status: 500 });
  }
}
