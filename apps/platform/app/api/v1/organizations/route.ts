import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  try {
    const org = await db.$transaction(async (tx) => {
      const existing = await tx.organization.findUnique({ where: { slug } });
      if (existing) {
        throw new Error("Organization with this name/slug already exists");
      }

      const newOrg = await tx.organization.create({
        data: {
          name,
          slug,
          members: {
            create: {
              userId: session.user.id,
              role: "owner"
            }
          }
        }
      });
      return newOrg;
    });

    return NextResponse.json({ id: org.id, slug: org.slug }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create organization" }, { status: 500 });
  }
}
