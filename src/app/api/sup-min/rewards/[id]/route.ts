import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  const body = await req.json();
  const data: any = {};
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.featured === "boolean") data.featured = body.featured;
  if (typeof body.pointsCost === "number") data.pointsCost = body.pointsCost;
  const found = await prisma.reward.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const reward = await prisma.reward.update({ where: { id }, data });
  return NextResponse.json({ ok: true, reward });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  await prisma.reward.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: new Date(), isActive: false } });
  return NextResponse.json({ ok: true });
}
