import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Heart, Gift, Coins } from "lucide-react";
import WorkspaceActions from "./WorkspaceActions";

export const dynamic = "force-dynamic";

export default async function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ws = await prisma.workspace.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "desc" } },
      _count: { select: { users: true, recognitions: true, redemptions: true, rewards: true } },
    },
  });
  if (!ws) return notFound();

  const pointsGiven = await prisma.recognition.aggregate({ where: { workspaceId: ws.id }, _sum: { points: true } });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link href="/sup-min/workspaces" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to workspaces
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{ws.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{ws.slug}</code>
            <span className="ml-2">· Created {ws.createdAt.toLocaleDateString()}</span>
          </p>
        </div>
        <WorkspaceActions workspaceId={ws.id} initialPlan={ws.plan} initialBudget={ws.monthlyBudgetPoints} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat icon={Users} label="Users" value={ws._count.users} />
        <Stat icon={Heart} label="Recognitions" value={ws._count.recognitions} />
        <Stat icon={Coins} label="Points Given" value={pointsGiven._sum.points || 0} />
        <Stat icon={Gift} label="Rewards" value={ws._count.rewards} />
        <Stat icon={Gift} label="Redemptions" value={ws._count.redemptions} />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Users ({ws.users.length})</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Name</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Email</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Role</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Give / Earn</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Last Login</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {ws.users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{u.email}</td>
                <td className="px-3 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{u.role}</span></td>
                <td className="px-3 py-3 text-sm text-gray-700">{u.giveablePoints} / {u.redeemablePoints}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{u.lastLoginAt?.toLocaleDateString() || "never"}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
