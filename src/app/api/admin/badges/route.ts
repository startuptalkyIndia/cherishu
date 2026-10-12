import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1).max(60),
  emoji: z.string().max(8).default("🏆"),
  color: z.string().max(20).default("indigo"),
});

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });
  try {
    // A soft-deleted badge keeps its unique (workspaceId, name) slot: restore it instead of failing.
    const trashed = await prisma.badge.findFirst({ where: { workspaceId: admin.workspaceId, name: parsed.data.name, deletedAt: { not: null } } });
    if (trashed) {
      const badge = await prisma.badge.update({
        where: { id: trashed.id },
        data: { deletedAt: null, emoji: parsed.data.emoji || "🏆", color: parsed.data.color },
      });
      return NextResponse.json({ ok: true, badge });
    }
    const badge = await prisma.badge.create({
      data: {
        workspaceId: admin.workspaceId,
        name: parsed.data.name,
        emoji: parsed.data.emoji || "🏆",
        color: parsed.data.color,
      },
    });
    return NextResponse.json({ ok: true, badge });
  } catch {
    return NextResponse.json({ error: "Badge with that name exists" }, { status: 400 });
  }
}
