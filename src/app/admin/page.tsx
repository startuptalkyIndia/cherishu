import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Users, Heart, Gift, Coins, TrendingUp } from "lucide-react";

export default async function AdminHome() {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!user.workspaceId) return null;

  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [users, recentKudos, monthlyKudos, redemptions, totalPointsGiven, budget] = await Promise.all([
    prisma.user.count({ where: { workspaceId: user.workspaceId, isActive: true } }),
    prisma.recognition.findMany({
      where: { workspaceId: user.workspaceId },
      include: { sender: { select: { name: true } }, receiver: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.recognition.count({ where: { workspaceId: user.workspaceId, createdAt: { gte: since } } }),
    prisma.redemption.count({ where: { workspaceId: user.workspaceId, createdAt: { gte: since } } }),
    prisma.recognition.aggregate({
      where: { workspaceId: user.workspaceId, createdAt: { gte: since } },
      _sum: { points: true },
    }),
    prisma.workspace.findUnique({ where: { id: user.workspaceId }, select: { monthlyBudgetPoints: true } }),
  ]);

  const pointsUsed = totalPointsGiven._sum.points || 0;
  const budgetPts = budget?.monthlyBudgetPoints || 0;
  const pct = budgetPts ? Math.min(100, Math.round((pointsUsed / budgetPts) * 100)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Your workspace at a glance.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat icon={Users} label="Active Users" value={users} tone="indigo" />
        <Stat icon={Heart} label="Kudos this month" value={monthlyKudos} tone="rose" />
        <Stat icon={Coins} label="Points used" value={pointsUsed} tone="yellow" />
        <Stat icon={Gift} label="Redemptions" value={redemptions} tone="green" />
      </div>

      {/* Budget card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Monthly Budget</h3>
            <p className="text-sm text-gray-500">{pointsUsed.toLocaleString()} of {budgetPts.toLocaleString()} points used</p>
          </div>
          <TrendingUp className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-xs text-gray-500">{pct}% utilized</div>
      </div>

      {/* Recent activity */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {recentKudos.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No recognitions yet.</div>
        ) : (
          recentKudos.map((r) => (
            <div key={r.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${r.isSystem ? (r.kind === "birthday" ? "bg-pink-100" : "bg-yellow-100") : "bg-indigo-100 text-indigo-600"}`}>
                {r.isSystem ? (r.kind === "birthday" ? "🎂" : "🎉") : (r.sender?.name[0]?.toUpperCase() || "?")}
              </div>
              <div className="flex-1 min-w-0 text-sm">
                {r.isSystem ? (
                  <span className="font-medium text-gray-900">{r.kind === "birthday" ? "🎂 Birthday" : "🎉 Anniversary"}</span>
                ) : (
                  <><span className="font-medium text-gray-900">{r.sender?.name}</span>
                  <span className="text-gray-500"> recognized </span></>
                )}
                <span className="text-gray-500">{r.isSystem ? " for " : ""}</span>
                <span className="font-medium text-gray-900">{r.receiver.name}</span>
                {r.points > 0 && <span className="text-indigo-600 font-medium"> · +{r.points} pts</span>}
                <p className="text-gray-600 text-xs mt-0.5 line-clamp-1">{r.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    rose: "bg-rose-50 text-rose-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
