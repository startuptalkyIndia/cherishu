import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { auditNomination } from "@/lib/audit";
import { emailKudosReceived } from "@/lib/email";
import { getChatConfig, postToChat } from "@/lib/chat-webhooks";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  points: z.number().int().min(0).optional(), // override the suggested points
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const { id } = await ctx.params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const nomination = await prisma.nomination.findFirst({
    where: { id, workspaceId: admin.workspaceId },
    include: { nominee: true, nominator: { select: { name: true } } },
  });
  if (!nomination) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (nomination.status !== "PENDING") {
    return NextResponse.json({ error: `Nomination already ${nomination.status.toLowerCase()}` }, { status: 400 });
  }

  if (parsed.data.action === "reject") {
    await prisma.nomination.update({ where: { id }, data: { status: "REJECTED", decidedAt: new Date() } });
    auditNomination("rejected", { workspaceId: admin.workspaceId, actorId: admin.id, nominationId: id });
    return NextResponse.json({ ok: true });
  }

  // Approve → convert to a system kudos with kind="anniversary"-style flag (we'll use null kind / isSystem=true / sender=admin)
  const points = parsed.data.points ?? nomination.points;
  const kudosMessage = `🏆 ${nomination.award} — ${nomination.reason}\n\nNominated by ${nomination.nominator.name}.`;

  const [recognition] = await prisma.$transaction([
    prisma.recognition.create({
      data: {
        workspaceId: admin.workspaceId,
        senderId: admin.id, // HR admin is the awarder
        receiverId: nomination.nomineeId,
        message: kudosMessage,
        points,
        // not flagged isSystem so it shows in normal feed with admin as sender
      },
    }),
    prisma.user.update({
      where: { id: nomination.nomineeId },
      data: { redeemablePoints: { increment: points } },
    }),
    prisma.nomination.update({
      where: { id },
      data: { status: "AWARDED", decidedAt: new Date(), points },
    }),
  ]);

  // Audit
  auditNomination("awarded", {
    workspaceId: admin.workspaceId, actorId: admin.id, nominationId: id,
    metadata: { award: nomination.award, points, recognitionId: recognition.id },
  });

  // Notify nominee + chat webhook (fire-and-forget)
  const workspace = await prisma.workspace.findUnique({ where: { id: admin.workspaceId } });
  if (workspace?.emailOnKudos) {
    emailKudosReceived({
      to: nomination.nominee.email,
      receiverName: nomination.nominee.name,
      senderName: `${admin.name} (HR)`,
      message: kudosMessage,
      points,
      workspaceName: workspace.name,
    }).catch(() => {});
  }
  if (workspace) {
    const chat = await getChatConfig(workspace as any, "nominationAwarded");
    if (chat) {
      postToChat(chat.type, chat.url, {
        kind: "nomination",
        workspaceName: workspace.name,
        senderName: admin.name,
        receiverName: nomination.nominee.name,
        message: nomination.reason,
        points,
        award: nomination.award,
        baseUrl: process.env.NEXTAUTH_URL || "https://cherishu.talkytools.com",
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, recognitionId: recognition.id });
}
