import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  nomineeId: z.string().min(1),
  award: z.string().min(1).max(80),
  reason: z.string().min(10).max(2000),
  points: z.number().int().min(0).max(100000).default(0),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });
  const input = parsed.data;
  if (input.nomineeId === user.id) return NextResponse.json({ error: "You can't nominate yourself" }, { status: 400 });

  const nominee = await prisma.user.findFirst({ where: { id: input.nomineeId, workspaceId: user.workspaceId } });
  if (!nominee) return NextResponse.json({ error: "Nominee not found" }, { status: 404 });

  const n = await prisma.nomination.create({
    data: {
      workspaceId: user.workspaceId,
      nominatorId: user.id,
      nomineeId: input.nomineeId,
      award: input.award,
      reason: input.reason,
      points: input.points,
    },
  });
  return NextResponse.json({ ok: true, id: n.id });
}
