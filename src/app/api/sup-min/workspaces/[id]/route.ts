import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  plan: z.enum(["free", "pro", "enterprise"]).optional(),
  monthlyBudgetPoints: z.number().int().min(0).max(100_000_000).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const data: any = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.plan !== undefined) data.plan = parsed.data.plan;
  if (parsed.data.monthlyBudgetPoints !== undefined) data.monthlyBudgetPoints = parsed.data.monthlyBudgetPoints;
  const ws = await prisma.workspace.update({ where: { id }, data });
  return NextResponse.json({ ok: true, workspace: ws });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  await prisma.workspace.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
