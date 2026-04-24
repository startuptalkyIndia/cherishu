import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getProvider } from "@/lib/reward-providers";
import { emailRedemptionFulfilled } from "@/lib/email";

const schema = z.object({
  rewardId: z.string().min(1),
  shippingAddress: z.object({
    name: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  const { rewardId, shippingAddress } = schema.parse(body);

  const reward = await prisma.reward.findFirst({
    where: {
      id: rewardId,
      isActive: true,
      OR: [{ workspaceId: user.workspaceId }, { workspaceId: null }],
    },
    include: { merchant: true },
  });
  if (!reward) return NextResponse.json({ error: "Reward not found or unavailable" }, { status: 404 });
  if (user.redeemablePoints < reward.pointsCost) {
    return NextResponse.json({ error: "Not enough points" }, { status: 400 });
  }
  if (reward.stock !== null && reward.stock <= 0) {
    return NextResponse.json({ error: "Out of stock" }, { status: 400 });
  }

  // Lookup provider config (for per-workspace API keys)
  const providerConfig = await prisma.rewardProviderConfig.findUnique({
    where: { workspaceId_provider: { workspaceId: user.workspaceId, provider: reward.provider } },
  });

  // Compute commission for marketplace rewards
  const commission = (reward.provider === "MARKETPLACE" && reward.merchant && reward.currencyValue)
    ? +(reward.currencyValue * reward.merchant.commissionPercent / 100).toFixed(2)
    : 0;

  // Create redemption row first (PENDING)
  const redemption = await prisma.redemption.create({
    data: {
      workspaceId: user.workspaceId,
      userId: user.id,
      rewardId: reward.id,
      merchantId: reward.merchantId || null,
      pointsSpent: reward.pointsCost,
      commissionEarned: commission,
      shippingAddress: shippingAddress as any,
      status: "PENDING",
    },
  });

  // Deduct points
  await prisma.user.update({
    where: { id: user.id },
    data: { redeemablePoints: { decrement: reward.pointsCost } },
  });

  // Call provider
  const provider = getProvider(reward.provider);
  const result = await provider.fulfill(
    {
      rewardId: reward.id,
      redemptionId: redemption.id,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      pointsSpent: reward.pointsCost,
      providerSku: reward.providerSku,
      currencyValue: reward.currencyValue,
      currency: reward.currency,
      shippingAddress: shippingAddress as any,
      merchantId: reward.merchantId,
    },
    providerConfig
      ? {
          apiKey: providerConfig.apiKey,
          apiSecret: providerConfig.apiSecret,
          accountId: providerConfig.accountId,
          config: providerConfig.config as Record<string, unknown> | null,
        }
      : undefined
  );

  if (!result.success && result.status === "FAILED") {
    // refund
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { redeemablePoints: { increment: reward.pointsCost } } }),
      prisma.redemption.update({
        where: { id: redemption.id },
        data: { status: "FAILED", notes: result.error || "Provider failure" },
      }),
    ]);
    return NextResponse.json({ error: result.error || "Fulfillment failed" }, { status: 502 });
  }

  const updated = await prisma.redemption.update({
    where: { id: redemption.id },
    data: {
      status: result.status,
      voucherCode: result.voucherCode || null,
      redemptionUrl: result.redemptionUrl || null,
      trackingNumber: result.trackingNumber || null,
      providerRef: result.providerRef || null,
      notes: result.notes || null,
      fulfilledAt: result.status === "FULFILLED" ? new Date() : null,
    },
  });

  // decrement stock if tracked
  if (reward.stock !== null) {
    await prisma.reward.update({ where: { id: reward.id }, data: { stock: { decrement: 1 } } });
  }

  // Send email if redemption was auto-fulfilled
  if (updated.status === "FULFILLED") {
    const workspace = await prisma.workspace.findUnique({ where: { id: user.workspaceId } });
    if (workspace?.emailOnRedemption) {
      emailRedemptionFulfilled({
        to: user.email,
        name: user.name,
        rewardName: reward.name,
        voucherCode: updated.voucherCode,
        redemptionUrl: updated.redemptionUrl,
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    ok: true,
    id: updated.id,
    status: updated.status,
    voucherCode: updated.voucherCode,
    redemptionUrl: updated.redemptionUrl,
  });
}
