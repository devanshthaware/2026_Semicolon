import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json() as { email?: string; password?: string; name?: string };
  const email = body.email?.toLowerCase().trim();
  if (!email || !body.password || body.password.length < 12) return NextResponse.json({ error: "Email and a password of at least 12 characters are required" }, { status: 400 });
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  const user = await db.user.create({ data: { email, name: body.name?.trim() || null, passwordHash: await hash(body.password, 12) } });
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
