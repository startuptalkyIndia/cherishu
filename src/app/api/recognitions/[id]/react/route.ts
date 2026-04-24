import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const ALLOWED = ["🎉", "👏", "💯", "❤️", "🔥", "🙌", "💜"];

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const { id } = await ctx.params;
  const { emoji } = await req.json();
  if (!ALLOWED.includes(emoji)) return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });

  const recognition = await prisma.recognition.findFirst({ where: { id, workspaceId: user.workspaceId } });
  if (!recognition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Toggle: if exists remove, else add
  const existing = await prisma.reaction.findUnique({
    where: { recognitionId_userId_emoji: { recognitionId: id, userId: user.id, emoji } },
  });
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, toggled: "off" });
  }
  await prisma.reaction.create({ data: { recognitionId: id, userId: user.id, emoji } });
  return NextResponse.json({ ok: true, toggled: "on" });
}
