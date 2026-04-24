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
  const reward = await prisma.reward.update({ where: { id }, data });
  return NextResponse.json({ ok: true, reward });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  await prisma.reward.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
