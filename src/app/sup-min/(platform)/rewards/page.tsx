import { prisma } from "@/lib/prisma";
import PlatformRewardsAdmin from "./PlatformRewardsAdmin";

export const dynamic = "force-dynamic";

export default async function PlatformRewardsPage() {
  const rewards = await prisma.reward.findMany({
    where: { workspaceId: null },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Rewards</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Global rewards available to every workspace.</p>
      <PlatformRewardsAdmin rewards={rewards.map(r => ({
        id: r.id, name: r.name, description: r.description, type: r.type, provider: r.provider,
        pointsCost: r.pointsCost, currencyValue: r.currencyValue, currency: r.currency,
        isActive: r.isActive, featured: r.featured, category: r.category,
      }))} />
    </div>
  );
}
