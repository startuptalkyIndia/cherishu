import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { REWARD_TYPE_META } from "@/lib/reward-providers";

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  FULFILLED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default async function RedemptionsPage() {
  const user = await requireUser();
  if (!user.workspaceId) return null;

  const redemptions = await prisma.redemption.findMany({
    where: { userId: user.id },
    include: { reward: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">My Redemptions</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Track your reward orders and voucher codes.</p>

      {redemptions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
          You haven&apos;t redeemed anything yet. Visit the <a href="/dashboard/rewards" className="text-indigo-600 hover:text-indigo-800 font-medium">rewards catalog</a> to get started.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Reward</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Type</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Points</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Voucher / Ref</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">When</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm text-gray-700">
                    <div className="font-medium text-gray-900">{r.reward.name}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700">
                    {REWARD_TYPE_META[r.reward.type]?.emoji} {REWARD_TYPE_META[r.reward.type]?.label || r.reward.type}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700">{r.pointsSpent}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700">
                    {r.voucherCode ? (
                      <div>
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{r.voucherCode}</code>
                        {r.redemptionUrl && (
                          <a href={r.redemptionUrl} target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs">Open</a>
                        )}
                      </div>
                    ) : r.providerRef ? (
                      <span className="text-xs text-gray-500">{r.providerRef}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">{formatDistanceToNow(r.createdAt, { addSuffix: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
