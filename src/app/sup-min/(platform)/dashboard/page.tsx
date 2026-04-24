import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, Users, Heart, Gift, Coins, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SupMinDashboard() {
  const [workspaces, userCount, recognitionCount, redemptionCount, pointsSum, recentWorkspaces, topWorkspaces] = await Promise.all([
    prisma.workspace.count(),
    prisma.user.count(),
    prisma.recognition.count(),
    prisma.redemption.count(),
    prisma.recognition.aggregate({ _sum: { points: true } }),
    prisma.workspace.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { _count: { select: { users: true } } } }),
    prisma.workspace.findMany({
      orderBy: { recognitions: { _count: "desc" } },
      take: 5,
      include: { _count: { select: { recognitions: true, users: true } } },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Everything across every workspace.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat icon={Building2} label="Workspaces" value={workspaces} href="/sup-min/workspaces" />
        <Stat icon={Users} label="Total Users" value={userCount} />
        <Stat icon={Heart} label="Recognitions" value={recognitionCount} />
        <Stat icon={Coins} label="Points Given" value={pointsSum._sum.points || 0} />
        <Stat icon={Gift} label="Redemptions" value={redemptionCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Recent Workspaces" href="/sup-min/workspaces">
          {recentWorkspaces.map((w) => (
            <RowLink key={w.id} href={`/sup-min/workspaces/${w.id}`} title={w.name} subtitle={`${w._count.users} users · ${w.plan}`} date={w.createdAt.toLocaleDateString()} />
          ))}
        </Panel>
        <Panel title="Most Active" href="/sup-min/workspaces">
          {topWorkspaces.map((w) => (
            <RowLink key={w.id} href={`/sup-min/workspaces/${w.id}`} title={w.name} subtitle={`${w._count.recognitions} kudos · ${w._count.users} users`} date={w.plan} />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, href }: { icon: any; label: string; value: number; href?: string }) {
  const body = (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Link href={href} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div>{children}</div>
    </div>
  );
}

function RowLink({ href, title, subtitle, date }: { href: string; title: string; subtitle: string; date: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <div>
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
      <div className="text-xs text-gray-500">{date}</div>
    </Link>
  );
}
