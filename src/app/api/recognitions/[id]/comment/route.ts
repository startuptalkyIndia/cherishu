import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({ message: z.string().min(1).max(500) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const recognition = await prisma.recognition.findFirst({ where: { id, workspaceId: user.workspaceId } });
  if (!recognition) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const comment = await prisma.comment.create({
    data: { recognitionId: id, userId: user.id, message: parsed.data.message },
  });
  return NextResponse.json({ ok: true, comment: { id: comment.id, message: comment.message, userId: user.id, userName: user.name, createdAt: comment.createdAt.toISOString() } });
}
