import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  const ws = await prisma.workspace.findUnique({ where: { id } });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Reset all user giveablePoints to default 500 (or pro-rate by plan in future)
  await prisma.user.updateMany({
    where: { workspaceId: id, isActive: true },
    data: { giveablePoints: 500 },
  });
  return NextResponse.json({ ok: true });
}
