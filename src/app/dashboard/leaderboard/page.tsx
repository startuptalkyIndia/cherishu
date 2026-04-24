import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Trophy, TrendingUp, Heart, Coins } from "lucide-react";

export default async function LeaderboardPage() {
  const user = await requireUser();
  if (!user.workspaceId) return null;

  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const topReceivers = await prisma.recognition.groupBy({
    by: ["receiverId"],
    where: { workspaceId: user.workspaceId, createdAt: { gte: since } },
    _sum: { points: true },
    _count: true,
    orderBy: { _sum: { points: "desc" } },
    take: 10,
  });

  // Exclude system recognitions (null senderId) from top givers
  const topGivers = await prisma.recognition.groupBy({
    by: ["senderId"],
    where: { workspaceId: user.workspaceId, createdAt: { gte: since }, senderId: { not: null } },
    _count: true,
    orderBy: { _count: { senderId: "desc" } },
    take: 10,
  });

  const userIds = [
    ...new Set([...topReceivers.map((r) => r.receiverId), ...topGivers.map((g) => g.senderId).filter((v): v is string => !!v)]),
  ];
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, jobTitle: true } });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" /> Leaderboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Top performers this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Most Recognized" icon={Heart} tone="rose" empty="No recognitions yet this month">
          {topReceivers.map((row, i) => {
            const u = userMap.get(row.receiverId);
            return (
              <Row key={row.receiverId} rank={i + 1} name={u?.name || "Unknown"} subtitle={u?.jobTitle || ""} metric={`${row._sum.points || 0} pts`} sub={`${row._count} kudos`} />
            );
          })}
        </Panel>
        <Panel title="Top Givers" icon={TrendingUp} tone="indigo" empty="No one has sent kudos yet">
          {topGivers.map((row, i) => {
            const u = row.senderId ? userMap.get(row.senderId) : null;
            return (
              <Row key={row.senderId || `n${i}`} rank={i + 1} name={u?.name || "Unknown"} subtitle={u?.jobTitle || ""} metric={`${row._count} kudos`} sub={<><Coins className="w-3 h-3 inline" /> given</>} />
            );
          })}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, tone, children, empty }: any) {
  const tones: Record<string, string> = {
    rose: "bg-rose-50 text-rose-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  const empty_ = Array.isArray(children) ? children.length === 0 : !children;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {empty_ ? (
        <div className="p-8 text-center text-sm text-gray-500">{empty}</div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}

function Row({ rank, name, subtitle, metric, sub }: any) {
  const rankColors: Record<number, string> = { 1: "bg-yellow-100 text-yellow-800", 2: "bg-gray-100 text-gray-700", 3: "bg-orange-100 text-orange-800" };
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankColors[rank] || "bg-gray-50 text-gray-500"}`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
        {subtitle && <div className="text-xs text-gray-500 truncate">{subtitle}</div>}
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900">{metric}</div>
        <div className="text-xs text-gray-500">{sub}</div>
      </div>
    </div>
  );
}
