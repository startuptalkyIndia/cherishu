import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { emailRedemptionFulfilled } from "@/lib/email";
import { auditRedemption } from "@/lib/audit";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const { id } = await ctx.params;

  const redemption = await prisma.redemption.findFirst({ where: { id, workspaceId: admin.workspaceId } });
  if (!redemption) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  if (body.action === "fulfill") {
    const updated = await prisma.redemption.update({
      where: { id },
      data: {
        status: "FULFILLED",
        voucherCode: body.voucherCode || redemption.voucherCode,
        fulfilledAt: new Date(),
      },
      include: { user: true, reward: true, workspace: true },
    });
    if (updated.workspace.emailOnRedemption) {
      emailRedemptionFulfilled({
        to: updated.user.email,
        name: updated.user.name,
        rewardName: updated.reward.name,
        voucherCode: updated.voucherCode,
        redemptionUrl: updated.redemptionUrl,
      }).catch(() => {});
    }
    auditRedemption("fulfilled", { workspaceId: admin.workspaceId, actorId: admin.id, redemptionId: id, metadata: { reward: updated.reward.name, voucher: updated.voucherCode } });
    return NextResponse.json({ ok: true, redemption: updated });
  }

  if (body.action === "cancel") {
    // refund points
    await prisma.$transaction([
      prisma.user.update({ where: { id: redemption.userId }, data: { redeemablePoints: { increment: redemption.pointsSpent } } }),
      prisma.redemption.update({ where: { id }, data: { status: "CANCELLED" } }),
    ]);
    auditRedemption("cancelled", { workspaceId: admin.workspaceId, actorId: admin.id, redemptionId: id, metadata: { refunded: redemption.pointsSpent } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
