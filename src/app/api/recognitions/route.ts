import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { emailKudosReceived } from "@/lib/email";

const schema = z.object({
  receiverId: z.string().min(1),
  message: z.string().min(1).max(2000),
  points: z.number().int().min(0).max(100000).default(0),
  badgeId: z.string().nullable().optional(),
  valueId: z.string().nullable().optional(),
  isPrivate: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });
  const input = parsed.data;

  if (input.receiverId === user.id) return NextResponse.json({ error: "You can't recognize yourself" }, { status: 400 });
  if (input.points > user.giveablePoints) return NextResponse.json({ error: "Not enough points to give" }, { status: 400 });

  const receiver = await prisma.user.findFirst({
    where: { id: input.receiverId, workspaceId: user.workspaceId },
  });
  if (!receiver) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

  const [recognition] = await prisma.$transaction([
    prisma.recognition.create({
      data: {
        workspaceId: user.workspaceId,
        senderId: user.id,
        receiverId: receiver.id,
        message: input.message,
        points: input.points,
        badgeId: input.badgeId || null,
        valueId: input.valueId || null,
        isPrivate: input.isPrivate || false,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { giveablePoints: { decrement: input.points } },
    }),
    prisma.user.update({
      where: { id: receiver.id },
      data: { redeemablePoints: { increment: input.points } },
    }),
  ]);

  // Fire-and-forget kudos email
  const workspace = await prisma.workspace.findUnique({ where: { id: user.workspaceId } });
  if (workspace?.emailOnKudos && !input.isPrivate) {
    emailKudosReceived({
      to: receiver.email,
      receiverName: receiver.name,
      senderName: user.name,
      message: input.message,
      points: input.points,
      workspaceName: workspace.name,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, id: recognition.id });
}
