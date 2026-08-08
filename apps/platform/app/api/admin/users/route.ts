import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ensureAdminProvisioned } from "@/lib/admin-bootstrap";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  // Ensure initial admin exists in DB
  await ensureAdminProvisioned();

  try {
    const users = await (db.user as any).findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
        status: true,
        organizations: {
          select: {
            organization: {
              select: {
                name: true,
                _count: {
                  select: { sessions: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedUsers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name || u.email.split("@")[0],
      role: u.role || "USER",
      status: u.status || "ACTIVE",
      createdAt: u.createdAt,
      verificationCount: u.organizations.reduce((acc: number, curr: any) => acc + (curr.organization?._count?.sessions || 0), 0)
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (role && ["USER", "ADMIN"].includes(role)) dataToUpdate.role = role;
    if (status && ["ACTIVE", "SUSPENDED"].includes(status)) dataToUpdate.status = status;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    // Record audit log entry
    await (db as any).auditLog.create({
      data: {
        admin: session.user.email || "Admin",
        action: status ? `USER_${status}` : `ROLE_CHANGE_${role}`,
        target: updatedUser.email,
        details: { userId, updatedFields: dataToUpdate }
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
