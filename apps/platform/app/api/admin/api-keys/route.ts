import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const apiKeys = await db.apiKey.findMany({
      include: {
        organization: {
          select: {
            name: true,
            members: {
              include: { user: { select: { email: true } } }
            }
          }
        },
        _count: { select: { sessions: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedKeys = apiKeys.map((key) => {
      const ownerEmail = key.organization.members[0]?.user?.email || key.organization.name;
      // Mask secret hashes: ak_live_••••••••7F2A
      const maskedKey = `ak_${key.status.toLowerCase()}_••••••••${key.prefix.slice(-4) || "7F2A"}`;

      return {
        id: key.id,
        name: key.name,
        maskedKey,
        owner: ownerEmail,
        status: key.status,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
        usageCount: key._count.sessions
      };
    });

    return NextResponse.json({ apiKeys: formattedKeys });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { keyId, action } = await req.json();

    if (!keyId || action !== "REVOKE") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const updatedKey = await db.apiKey.update({
      where: { id: keyId },
      data: { status: "REVOKED", revokedAt: new Date() }
    });

    await (db as any).auditLog.create({
      data: {
        admin: session.user.email || "Admin",
        action: "API_KEY_REVOKED",
        target: updatedKey.id,
        details: { keyId }
      }
    });

    return NextResponse.json({ success: true, key: updatedKey });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
  }
}
