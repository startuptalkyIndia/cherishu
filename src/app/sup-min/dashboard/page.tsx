import { requirePlatformAdmin } from "@/lib/platform-auth";
import { prisma } from "@/lib/prisma";
import { Building2, Users, Heart, Gift, Shield, LogOut } from "lucide-react";
import Link from "next/link";
import SupMinLogoutButton from "./LogoutButton";

export default async function SupMinDashboard() {
  const admin = await requirePlatformAdmin();
  const [workspaces, userCount, recognitionCount, redemptionCount] = await Promise.all([
    prisma.workspace.findMany({
      include: {
        _count: { select: { users: true, recognitions: true, redemptions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
    prisma.recognition.count(),
    prisma.redemption.count(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="font-bold">Cherishu Admin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">{admin.email}</span>
            <SupMinLogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5 mb-6">All workspaces, users, and activity.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat icon={Building2} label="Workspaces" value={workspaces.length} />
          <Stat icon={Users} label="Total Users" value={userCount} />
          <Stat icon={Heart} label="Recognitions" value={recognitionCount} />
          <Stat icon={Gift} label="Redemptions" value={redemptionCount} />
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-3">Workspaces</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Name</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Slug</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Plan</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Users</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Recognitions</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Redemptions</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Created</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((w) => (
                <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm text-gray-900 font-medium">{w.name}</td>
                  <td className="px-3 py-3 text-sm text-gray-700"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{w.slug}</code></td>
                  <td className="px-3 py-3 text-sm text-gray-700"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{w.plan}</span></td>
                  <td className="px-3 py-3 text-sm text-gray-700">{w._count.users}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{w._count.recognitions}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{w._count.redemptions}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{w.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {workspaces.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-gray-500">No workspaces yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
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
