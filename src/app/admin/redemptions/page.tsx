import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import RedemptionActions from "./RedemptionActions";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  FULFILLED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default async function AdminRedemptionsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return null;
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 50;
  const q = (sp.q || "").trim();
  const status = sp.status || "";
  const provider = sp.provider || "";

  const where: any = { workspaceId: admin.workspaceId };
  if (status) where.status = status;
  if (provider) where.reward = { provider };
  if (q) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { reward: { name: { contains: q, mode: "insensitive" } } },
      { voucherCode: { contains: q, mode: "insensitive" } },
    ];
  }

  const [redemptions, total] = await Promise.all([
    prisma.redemption.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, reward: { select: { name: true, type: true, provider: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.redemption.count({ where }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Redemptions</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Fulfill and track all reward redemptions.</p>

      <FilterBar
        searchPlaceholder="Search by user, reward, or voucher…"
        filters={[
          { key: "status", label: "Status", options: [
            { label: "All", value: "" },
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Fulfilled", value: "FULFILLED" },
            { label: "Failed", value: "FAILED" },
            { label: "Cancelled", value: "CANCELLED" },
          ]},
          { key: "provider", label: "Provider", options: [
            { label: "All", value: "" },
            { label: "Manual", value: "MANUAL" },
            { label: "Marketplace", value: "MARKETPLACE" },
            { label: "Xoxoday", value: "XOXODAY" },
            { label: "Tremendous", value: "TREMENDOUS" },
            { label: "Amazon", value: "AMAZON_INCENTIVES" },
            { label: "Giftbit", value: "GIFTBIT" },
          ]},
        ]}
        total={total}
        pageSize={pageSize}
      >
        <a href="/api/admin/export?type=redemptions" className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg text-xs hover:bg-gray-200">
          Export CSV
        </a>
      </FilterBar>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">User</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Reward</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Provider</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Points</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Voucher</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">When</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {redemptions.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm">
                  <div className="font-medium text-gray-900">{r.user.name}</div>
                  <div className="text-xs text-gray-500">{r.user.email}</div>
                </td>
                <td className="px-3 py-3 text-sm text-gray-700">{r.reward.name}</td>
                <td className="px-3 py-3 text-xs text-gray-600">{r.reward.provider}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{r.pointsSpent}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-gray-700">
                  {r.voucherCode ? <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{r.voucherCode}</code> : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">{formatDistanceToNow(r.createdAt, { addSuffix: true })}</td>
                <td className="px-3 py-3">
                  <RedemptionActions id={r.id} status={r.status} />
                </td>
              </tr>
            ))}
            {redemptions.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-12 text-center text-sm text-gray-500">
                {q || status || provider
                  ? <>No redemptions match these filters. <a href="/admin/redemptions" className="text-indigo-600 hover:text-indigo-800 font-medium">Clear filters</a></>
                  : "No redemptions yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
