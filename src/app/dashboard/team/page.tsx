import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Send, Heart, Coins, Users } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await requireUser();
  if (!user.workspaceId) return null;

  // Only managers (or HR/super admin) see this page
  if (user.role !== "MANAGER" && user.role !== "HR_ADMIN" && user.role !== "SUPER_ADMIN") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-gray-900">Team view</h1>
        <p className="text-sm text-gray-500 mt-1">Only managers can see this page. Your role is {user.role.replace("_", " ")}.</p>
      </div>
    );
  }

  // Direct reports for managers; for HR/super admin, show all employees
  const reports = await prisma.user.findMany({
    where: user.role === "MANAGER"
      ? { workspaceId: user.workspaceId, managerId: user.id, isActive: true }
      : { workspaceId: user.workspaceId, isActive: true, id: { not: user.id } },
    select: { id: true, name: true, email: true, jobTitle: true, department: true, redeemablePoints: true, giveablePoints: true },
    orderBy: { name: "asc" },
  });

  // Stats this month
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const reportIds = reports.map(r => r.id);
  const [received, sent] = await Promise.all([
    prisma.recognition.groupBy({
      by: ["receiverId"],
      where: { workspaceId: user.workspaceId, receiverId: { in: reportIds }, createdAt: { gte: since } },
      _sum: { points: true },
      _count: true,
    }),
    prisma.recognition.groupBy({
      by: ["senderId"],
      where: { workspaceId: user.workspaceId, senderId: { in: reportIds }, createdAt: { gte: since } },
      _count: true,
    }),
  ]);

  const receivedMap = new Map(received.map(r => [r.receiverId, { points: r._sum.points || 0, count: r._count }]));
  const sentMap = new Map(sent.map(r => [r.senderId, r._count]));

  // Aggregate totals
  const teamReceived = received.reduce((sum, r) => sum + (r._sum.points || 0), 0);
  const teamSent = sent.reduce((sum, r) => sum + r._count, 0);
  const teamSize = reports.length;

  const subtitle = user.role === "MANAGER"
    ? `${teamSize} direct ${teamSize === 1 ? "report" : "reports"}`
    : `${teamSize} active teammates`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            {user.role === "MANAGER" ? "My Team" : "All Teammates"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle} · This month&apos;s activity</p>
        </div>
        <Link href="/dashboard/send" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Send className="w-4 h-4" /> Send kudos
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Stat icon={Users} label="Team size" value={teamSize} />
        <Stat icon={Heart} label="Kudos received this month" value={teamReceived} />
        <Stat icon={Coins} label="Kudos sent this month" value={teamSent} />
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            context={user.role === "MANAGER" ? "Cherishu · My Team" : "Cherishu · All Teammates"}
            icon="👥"
            title={user.role === "MANAGER" ? "No direct reports yet" : "No teammates yet"}
            reason={user.role === "MANAGER"
              ? "Ask your HR admin to assign team members to you in the Users section."
              : "Once teammates are added to your workspace, they'll show up here."}
            action={{ label: user.role === "MANAGER" ? "Contact HR admin" : "Go to feed", href: user.role === "MANAGER" ? "/dashboard" : "/dashboard" }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Name</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Title</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Received</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Sent</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Wallet</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const recv = receivedMap.get(r.id);
                const snd = sentMap.get(r.id) || 0;
                const lowEngagement = !recv && snd === 0;
                return (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <Link href={`/dashboard/u/${r.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">{r.name}</Link>
                      <div className="text-xs text-gray-500">{r.email}</div>
                      {lowEngagement && (
                        <span className="inline-flex mt-1 items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠ No activity this month
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{r.jobTitle || "—"} · {r.department || "—"}</td>
                    <td className="px-3 py-3 text-sm">
                      {recv ? <span className="font-semibold text-rose-700">{recv.points} pts</span> : <span className="text-gray-400">—</span>}
                      {recv && <div className="text-xs text-gray-500">{recv.count} kudos</div>}
                    </td>
                    <td className="px-3 py-3 text-sm">{snd > 0 ? <span className="font-semibold text-indigo-700">{snd}</span> : <span className="text-gray-400">—</span>}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{r.giveablePoints} / {r.redeemablePoints}</td>
                    <td className="px-3 py-3 text-right">
                      <Link href={`/dashboard/send?to=${r.id}`} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Recognize →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon className="w-4 h-4" /></div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
