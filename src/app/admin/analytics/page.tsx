import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Download } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!user.workspaceId) return null;

  const since = new Date();
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);

  const [recognitions, topValues, topBadges, byDept] = await Promise.all([
    prisma.recognition.findMany({
      where: { workspaceId: user.workspaceId, createdAt: { gte: since } },
      select: { createdAt: true, points: true, receiverId: true },
    }),
    prisma.recognition.groupBy({
      by: ["valueId"],
      where: { workspaceId: user.workspaceId, valueId: { not: null }, createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { valueId: "desc" } },
    }),
    prisma.recognition.groupBy({
      by: ["badgeId"],
      where: { workspaceId: user.workspaceId, badgeId: { not: null }, createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { badgeId: "desc" } },
    }),
    prisma.user.groupBy({
      by: ["department"],
      where: { workspaceId: user.workspaceId, isActive: true },
      _count: true,
    }),
  ]);

  // Daily kudos
  const daily = new Map<string, { count: number; points: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since); d.setDate(d.getDate() + i);
    daily.set(d.toISOString().slice(0, 10), { count: 0, points: 0 });
  }
  for (const r of recognitions) {
    const key = r.createdAt.toISOString().slice(0, 10);
    const entry = daily.get(key);
    if (entry) { entry.count++; entry.points += r.points; }
  }
  const dailyArr = Array.from(daily.entries()).map(([date, d]) => ({ date, ...d }));
  const maxCount = Math.max(1, ...dailyArr.map(d => d.count));

  // Resolve values & badges names
  const valueIds = topValues.map(v => v.valueId).filter((v): v is string => !!v);
  const badgeIds = topBadges.map(b => b.badgeId).filter((b): b is string => !!b);
  const [values, badges] = await Promise.all([
    prisma.companyValue.findMany({ where: { id: { in: valueIds } } }),
    prisma.badge.findMany({ where: { id: { in: badgeIds } } }),
  ]);
  const valueMap = new Map(values.map(v => [v.id, v]));
  const badgeMap = new Map(badges.map(b => [b.id, b]));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Last 30 days</p>
        </div>
        <div className="flex gap-2">
          <Link href="/api/admin/export?type=recognitions" className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-2">
            <Download className="w-4 h-4" /> Recognitions CSV
          </Link>
          <Link href="/api/admin/export?type=redemptions" className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-2">
            <Download className="w-4 h-4" /> Redemptions CSV
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Recognitions (daily)</h3>
        <div className="flex items-end gap-1 h-40">
          {dailyArr.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center group relative">
              <div className="w-full bg-indigo-600 rounded-t transition-all hover:bg-indigo-700" style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "3px" : "0" }} />
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                {d.date}: {d.count} kudos, {d.points} pts
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{dailyArr[0]?.date}</span><span>{dailyArr[dailyArr.length - 1]?.date}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Top Company Values</h3>
          {topValues.length === 0 ? <p className="text-sm text-gray-500">No value-tagged kudos yet.</p> : (
            <ul className="space-y-2">
              {topValues.slice(0, 8).map((v) => {
                const val = valueMap.get(v.valueId!);
                return (
                  <li key={v.valueId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 font-medium">{val?.emoji} {val?.name || "Unknown"}</span>
                    <span className="text-indigo-600 font-semibold">{v._count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Top Badges</h3>
          {topBadges.length === 0 ? <p className="text-sm text-gray-500">No badges awarded yet.</p> : (
            <ul className="space-y-2">
              {topBadges.slice(0, 8).map((b) => {
                const bdg = badgeMap.get(b.badgeId!);
                return (
                  <li key={b.badgeId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 font-medium">{bdg?.emoji} {bdg?.name || "Unknown"}</span>
                    <span className="text-indigo-600 font-semibold">{b._count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">Users by Department</h3>
          {byDept.length === 0 ? <p className="text-sm text-gray-500">No departments yet.</p> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {byDept.map((d) => (
                <div key={d.department || "none"} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">{d.department || "Unassigned"}</div>
                  <div className="text-xl font-bold text-gray-900">{d._count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
