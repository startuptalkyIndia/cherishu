import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import RewardsAdmin from "./RewardsAdmin";

export default async function AdminRewardsPage() {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!user.workspaceId) return null;
  const rewards = await prisma.reward.findMany({
    where: { OR: [{ workspaceId: user.workspaceId }, { workspaceId: null }] },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  const providerConfigs = await prisma.rewardProviderConfig.findMany({
    where: { workspaceId: user.workspaceId },
  });
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rewards Catalog</h1>
        <p className="text-sm text-gray-500 mt-0.5 mb-6">Manage rewards and provider integrations.</p>
      </div>
      <RewardsAdmin
        rewards={rewards.map((r) => ({
          id: r.id, name: r.name, type: r.type, provider: r.provider, pointsCost: r.pointsCost,
          currencyValue: r.currencyValue, currency: r.currency, isActive: r.isActive, featured: r.featured,
          workspaceScoped: !!r.workspaceId,
        }))}
        providerConfigs={providerConfigs.map((c) => ({ provider: c.provider, isEnabled: c.isEnabled, hasKey: !!c.apiKey }))}
      />
    </div>
  );
}
