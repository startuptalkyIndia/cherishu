import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const { id } = await ctx.params;

  const reward = await prisma.reward.findFirst({ where: { id, workspaceId: admin.workspaceId } });
  if (!reward) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const allowed: any = {};
  if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
  if (typeof body.featured === "boolean") allowed.featured = body.featured;
  if (typeof body.pointsCost === "number") allowed.pointsCost = body.pointsCost;

  const updated = await prisma.reward.update({ where: { id }, data: allowed });
  return NextResponse.json({ ok: true, reward: updated });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const { id } = await ctx.params;
  await prisma.reward.deleteMany({ where: { id, workspaceId: admin.workspaceId } });
  return NextResponse.json({ ok: true });
}
