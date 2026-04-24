import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  const count = await prisma.platformAdmin.count();
  if (count <= 1) return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
  await prisma.platformAdmin.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
