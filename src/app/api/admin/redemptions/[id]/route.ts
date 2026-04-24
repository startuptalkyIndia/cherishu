import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

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
    });
    return NextResponse.json({ ok: true, redemption: updated });
  }

  if (body.action === "cancel") {
    // refund points
    await prisma.$transaction([
      prisma.user.update({ where: { id: redemption.userId }, data: { redeemablePoints: { increment: redemption.pointsSpent } } }),
      prisma.redemption.update({ where: { id }, data: { status: "CANCELLED" } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
