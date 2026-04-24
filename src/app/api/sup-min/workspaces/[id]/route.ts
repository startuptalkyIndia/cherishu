import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  const body = await req.json();
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.plan === "string") data.plan = body.plan;
  if (typeof body.monthlyBudgetPoints === "number") data.monthlyBudgetPoints = body.monthlyBudgetPoints;
  const ws = await prisma.workspace.update({ where: { id }, data });
  return NextResponse.json({ ok: true, workspace: ws });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  await prisma.workspace.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
