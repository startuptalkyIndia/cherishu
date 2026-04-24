import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { REWARD_TYPE_META } from "@/lib/reward-providers";
import RewardsGrid from "./RewardsGrid";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

export default async function RewardsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  if (!user.workspaceId) return null;
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 24;
  const q = (sp.q || "").trim();
  const type = sp.type || "";
  const affordable = sp.affordable === "1";
  const featured = sp.featured === "1";
  const sort = sp.sort || "featured";

  const where: any = {
    isActive: true,
    OR: [{ workspaceId: user.workspaceId }, { workspaceId: null }],
  };
  if (type) where.type = type;
  if (featured) where.featured = true;
  if (affordable) where.pointsCost = { lte: user.redeemablePoints };
  if (q) {
    where.AND = [
      { OR: where.OR },
      { OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ]},
    ];
    delete where.OR;
  }

  const orderByMap: Record<string, any> = {
    "featured": [{ featured: "desc" }, { pointsCost: "asc" }],
    "cheapest": { pointsCost: "asc" },
    "expensive": { pointsCost: "desc" },
    "newest": { createdAt: "desc" },
  };
  const orderBy = orderByMap[sort] || orderByMap["featured"];

  const [rewards, total] = await Promise.all([
    prisma.reward.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.reward.count({ where }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards Catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">Redeem your {user.redeemablePoints} points for amazing rewards.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-gray-500">Balance:</span>{" "}
          <span className="font-semibold text-indigo-600">{user.redeemablePoints} pts</span>
        </div>
      </div>

      {/* Type chips (also settable via URL type=...) */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <TypeChip label="All" value="" current={type} />
        {Object.entries(REWARD_TYPE_META).map(([key, meta]) => (
          <TypeChip key={key} label={`${meta.emoji} ${meta.label}`} value={key} current={type} />
        ))}
      </div>

      <FilterBar
        searchPlaceholder="Search rewards…"
        filters={[
          { key: "affordable", label: "", options: [
            { label: "All", value: "" },
            { label: "Can afford", value: "1" },
          ]},
          { key: "featured", label: "", options: [
            { label: "All", value: "" },
            { label: "Featured only", value: "1" },
          ]},
        ]}
        sort={{ key: "sort", label: "Sort", options: [
          { label: "Featured first", value: "featured" },
          { label: "Cheapest", value: "cheapest" },
          { label: "Most expensive", value: "expensive" },
          { label: "Newest", value: "newest" },
        ]}}
        total={total}
        pageSize={pageSize}
      />

      <RewardsGrid
        rewards={rewards.map((r) => ({
          id: r.id, name: r.name, description: r.description, imageUrl: r.imageUrl,
          type: r.type, provider: r.provider, pointsCost: r.pointsCost,
          currencyValue: r.currencyValue, currency: r.currency, category: r.category, featured: r.featured,
        }))}
        redeemable={user.redeemablePoints}
      />
    </div>
  );
}

function TypeChip({ label, value, current }: { label: string; value: string; current: string }) {
  const active = value === current;
  const href = value ? `/dashboard/rewards?type=${value}` : "/dashboard/rewards";
  return (
    <a href={href} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${active ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
      {label}
    </a>
  );
}
