import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { REWARD_TYPE_META } from "@/lib/reward-providers";
import RewardsGrid from "./RewardsGrid";

export default async function RewardsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const user = await requireUser();
  if (!user.workspaceId) return null;
  const sp = await searchParams;

  const where: any = {
    isActive: true,
    OR: [{ workspaceId: user.workspaceId }, { workspaceId: null }],
  };
  if (sp.type) where.type = sp.type;

  const rewards = await prisma.reward.findMany({
    where,
    orderBy: [{ featured: "desc" }, { pointsCost: "asc" }],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards Catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">Redeem your {user.redeemablePoints} points for amazing rewards.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-gray-500">Balance:</span>{" "}
          <span className="font-semibold text-indigo-600">{user.redeemablePoints} pts</span>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        <a href="/dashboard/rewards" className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${!sp.type ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
          All
        </a>
        {Object.entries(REWARD_TYPE_META).map(([key, meta]) => (
          <a
            key={key}
            href={`/dashboard/rewards?type=${key}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${sp.type === key ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            {meta.emoji} {meta.label}
          </a>
        ))}
      </div>

      <RewardsGrid rewards={rewards} redeemable={user.redeemablePoints} />
    </div>
  );
}
