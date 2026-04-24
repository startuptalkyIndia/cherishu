import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  // Last 30 days recognitions per day
  const since = new Date();
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);

  const recognitions = await prisma.recognition.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, points: true, workspaceId: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const dailyMap = new Map<string, { count: number; points: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since); d.setDate(d.getDate() + i);
    dailyMap.set(d.toISOString().slice(0, 10), { count: 0, points: 0 });
  }
  for (const r of recognitions) {
    const key = r.createdAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) { entry.count++; entry.points += r.points; }
  }
  const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data }));
  const maxCount = Math.max(1, ...daily.map(d => d.count));

  // By workspace
  const byWs = await prisma.recognition.groupBy({
    by: ["workspaceId"],
    where: { createdAt: { gte: since } },
    _count: true,
    orderBy: { _count: { workspaceId: "desc" } },
    take: 10,
  });
  const wsIds = byWs.map(r => r.workspaceId);
  const wsMap = new Map((await prisma.workspace.findMany({ where: { id: { in: wsIds } }, select: { id: true, name: true } })).map(w => [w.id, w.name]));

  // Redemptions breakdown
  const redemptionsByStatus = await prisma.redemption.groupBy({ by: ["status"], _count: true });
  const redemptionsByType = await prisma.redemption.findMany({ include: { reward: { select: { type: true } } }, take: 500 });
  const typeCounts: Record<string, number> = {};
  for (const r of redemptionsByType) typeCounts[r.reward.type] = (typeCounts[r.reward.type] || 0) + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Last 30 days across the platform.</p>

      {/* Daily chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Recognitions (daily)</h3>
        <div className="flex items-end gap-1 h-40">
          {daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center group relative">
              <div className="w-full bg-indigo-600 rounded-t transition-all hover:bg-indigo-700" style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "3px" : "0" }} />
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {d.date}: {d.count} kudos, {d.points} pts
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{daily[0]?.date}</span>
          <span>{daily[daily.length - 1]?.date}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Top Workspaces</h3>
          {byWs.length === 0 ? <p className="text-sm text-gray-500">No activity.</p> : (
            <ul className="space-y-2">
              {byWs.map((w) => (
                <li key={w.workspaceId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900 font-medium">{wsMap.get(w.workspaceId) || "Unknown"}</span>
                  <span className="text-indigo-600 font-semibold">{w._count} kudos</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Redemptions by Status</h3>
          <ul className="space-y-2">
            {redemptionsByStatus.map((s) => (
              <li key={s.status} className="flex items-center justify-between text-sm">
                <span className="text-gray-900 font-medium">{s.status}</span>
                <span className="text-indigo-600 font-semibold">{s._count}</span>
              </li>
            ))}
            {redemptionsByStatus.length === 0 && <p className="text-sm text-gray-500">No redemptions yet.</p>}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">Redemptions by Reward Type</h3>
          {Object.keys(typeCounts).length === 0 ? <p className="text-sm text-gray-500">No redemptions yet.</p> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(typeCounts).map(([t, c]) => (
                <div key={t} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">{t}</div>
                  <div className="text-xl font-bold text-gray-900">{c}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
