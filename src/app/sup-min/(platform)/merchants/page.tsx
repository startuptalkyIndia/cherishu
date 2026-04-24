import { prisma } from "@/lib/prisma";
import MerchantsList from "./MerchantsList";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

export default async function MerchantsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 30;
  const q = (sp.q || "").trim();
  const status = sp.status || "";
  const handoff = sp.handoff || "";

  const where: any = {};
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;
  if (handoff) where.handoffMethod = handoff;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { contactEmail: { contains: q, mode: "insensitive" } },
    ];
  }

  const [merchants, total] = await Promise.all([
    prisma.merchant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
      include: { _count: { select: { rewards: true, redemptions: true } } },
    }),
    prisma.merchant.count({ where }),
  ]);

  const merchantIds = merchants.map((m) => m.id);
  const commissions = await prisma.redemption.groupBy({
    by: ["merchantId"],
    where: { merchantId: { in: merchantIds } },
    _sum: { commissionEarned: true },
  });
  const commissionMap = new Map(commissions.map((c) => [c.merchantId, c._sum.commissionEarned || 0]));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchants</h1>
          <p className="text-sm text-gray-500 mt-0.5">Partner brands whose products you list. They fulfill; you collect commission.</p>
        </div>
      </div>

      <MerchantsList
        initial={merchants.map((m) => ({
          id: m.id, name: m.name, slug: m.slug, contactEmail: m.contactEmail,
          commissionPercent: m.commissionPercent, handoffMethod: m.handoffMethod,
          isActive: m.isActive, rewardCount: m._count.rewards, redemptionCount: m._count.redemptions,
          earnings: commissionMap.get(m.id) || 0,
        }))}
        total={total}
        pageSize={pageSize}
      />
    </div>
  );
}
