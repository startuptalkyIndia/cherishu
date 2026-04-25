import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function PATCH(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const body = await req.json();
  const data: any = {};
  if (typeof body.billingEmail === "string") data.billingEmail = body.billingEmail || null;
  await prisma.workspace.update({ where: { id: admin.workspaceId }, data });
  return NextResponse.json({ ok: true });
}
