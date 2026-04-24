import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { emailKudosReceived } from "@/lib/email";
import { getChatConfig, postToChat } from "@/lib/chat-webhooks";

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

  const workspace = await prisma.workspace.findUnique({ where: { id: user.workspaceId } });

  // Fire-and-forget kudos email
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

  // Fire-and-forget chat webhook (Slack/Teams/Discord/generic)
  if (workspace && !input.isPrivate) {
    const chat = await getChatConfig(workspace as any, "kudos");
    if (chat) {
      let badgeName: string | null = null;
      let valueName: string | null = null;
      if (input.badgeId) badgeName = (await prisma.badge.findUnique({ where: { id: input.badgeId } }))?.name || null;
      if (input.valueId) valueName = (await prisma.companyValue.findUnique({ where: { id: input.valueId } }))?.name || null;
      postToChat(chat.type, chat.url, {
        kind: "kudos",
        workspaceName: workspace.name,
        senderName: user.name,
        receiverName: receiver.name,
        message: input.message,
        points: input.points,
        badge: badgeName,
        value: valueName,
        baseUrl: process.env.NEXTAUTH_URL || "https://cherishu.talkytools.com",
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, id: recognition.id });
}
