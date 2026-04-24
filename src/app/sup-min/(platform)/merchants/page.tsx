import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MerchantsList from "./MerchantsList";

export const dynamic = "force-dynamic";

export default async function MerchantsPage() {
  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { rewards: true, redemptions: true } },
    },
  });

  // earnings per merchant (commission sum)
  const commissions = await prisma.redemption.groupBy({
    by: ["merchantId"],
    where: { merchantId: { not: null } },
    _sum: { commissionEarned: true },
    _count: true,
  });
  const commissionMap = new Map(commissions.map((c) => [c.merchantId, { total: c._sum.commissionEarned || 0, orders: c._count }]));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchants</h1>
          <p className="text-sm text-gray-500 mt-0.5">Partner brands whose products you list. They fulfill; you collect commission.</p>
        </div>
      </div>
      <MerchantsList initial={merchants.map((m) => ({
        id: m.id, name: m.name, slug: m.slug, contactEmail: m.contactEmail,
        commissionPercent: m.commissionPercent, handoffMethod: m.handoffMethod,
        isActive: m.isActive, rewardCount: m._count.rewards, redemptionCount: m._count.redemptions,
        earnings: commissionMap.get(m.id)?.total || 0,
      }))} />
    </div>
  );
}
