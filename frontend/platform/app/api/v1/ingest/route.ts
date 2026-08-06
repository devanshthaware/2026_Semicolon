import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "../../../../../lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.activeOrgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, url, text, sourceName = "General Knowledge" } = await request.json();
  
  if (!title || !text) {
    return NextResponse.json({ error: "Title and text are required" }, { status: 400 });
  }

  try {
    // 1. Find or create evidence source
    let source = await db.evidenceSource.findFirst({
      where: { name: sourceName, organizationId: session.user.activeOrgId }
    });
    
    if (!source) {
      source = await db.evidenceSource.create({
        data: { name: sourceName, organizationId: session.user.activeOrgId }
      });
    }

    // 2. Create Document record
    const document = await db.document.create({
      data: {
        title,
        url,
        evidenceSourceId: source.id,
        organizationId: session.user.activeOrgId
      }
    });

    // 3. Create Ingestion Job
    const job = await db.ingestionJob.create({
      data: {
        documentId: document.id,
        status: "processing",
        organizationId: session.user.activeOrgId
      }
    });

    // 4. Send to Python Engine
    const engineUrl = process.env.VERIFICATION_ENGINE_URL || "http://localhost:8000";
    const engineRes = await fetch(`${engineUrl}/v1/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_id: document.id,
        text: text,
        source_name: source.name
      })
    });

    if (!engineRes.ok) {
      const errText = await engineRes.text();
      await db.ingestionJob.update({
        where: { id: job.id },
        data: { status: "failed", error: errText }
      });
      throw new Error(`Engine error: ${errText}`);
    }

    const engineData = await engineRes.json();
    
    // 5. Update Job Status
    await db.ingestionJob.update({
      where: { id: job.id },
      data: { status: "completed" }
    });

    return NextResponse.json({ success: true, documentId: document.id, chunks: engineData.chunks }, { status: 201 });
    
  } catch (error: any) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ error: error.message || "Ingestion failed" }, { status: 500 });
  }
}
