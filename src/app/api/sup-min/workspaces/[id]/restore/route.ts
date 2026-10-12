import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

// Undo a soft delete (see DELETE in ../route.ts). Platform admins only.
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;
  const res = await prisma.workspace.updateMany({ where: { id, deletedAt: { not: null } }, data: { deletedAt: null } });
  if (res.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
