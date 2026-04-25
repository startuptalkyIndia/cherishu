import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  TRIAL: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  PAST_DUE: "bg-yellow-100 text-yellow-800",
  PAUSED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-800",
  EXPIRED: "bg-gray-100 text-gray-700",
};

export default async function PlatformBillingPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 30;
  const status = sp.status || "";
  const q = (sp.q || "").trim();

  const where: any = {};
  if (status) where.status = status;
  if (q) where.workspace = {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ],
  };

  const [subs, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: { workspace: { select: { name: true, slug: true, plan: true } }, _count: { select: { events: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
    }),
    prisma.subscription.count({ where }),
  ]);

  // Compute MRR (active subs only)
  const activeSubs = await prisma.subscription.findMany({ where: { status: "ACTIVE" } });
  const mrr = activeSubs.reduce((sum, s) => sum + (s.pricePerSeatMonthly * s.seatsPurchased), 0);
  const trialCount = await prisma.subscription.count({ where: { status: "TRIAL" } });
  const workspaceCount = await prisma.workspace.count();
  const paidWorkspaces = await prisma.workspace.count({ where: { plan: { in: ["pro", "enterprise"] } } });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Billing</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Subscriptions and revenue across all workspaces.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Monthly Recurring Revenue" value={`₹${mrr.toLocaleString()}`} tone="green" />
        <Stat label="Active subscriptions" value={activeSubs.length} tone="indigo" />
        <Stat label="Trialling" value={trialCount} tone="blue" />
        <Stat label="Paid conversion" value={`${workspaceCount ? Math.round(paidWorkspaces / workspaceCount * 100) : 0}%`} sub={`${paidWorkspaces} of ${workspaceCount} workspaces`} />
      </div>

      <FilterBar
        searchPlaceholder="Search workspace…"
        filters={[
          { key: "status", label: "Status", options: [
            { label: "All", value: "" },
            { label: "Trial", value: "TRIAL" },
            { label: "Active", value: "ACTIVE" },
            { label: "Past due", value: "PAST_DUE" },
            { label: "Paused", value: "PAUSED" },
            { label: "Cancelled", value: "CANCELLED" },
            { label: "Expired", value: "EXPIRED" },
          ]},
        ]}
        total={total}
        pageSize={pageSize}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Workspace</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Plan</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Seats</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">MRR</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Renews</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Razorpay ID</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm">
                  <Link href={`/sup-min/workspaces/${s.workspaceId}`} className="font-medium text-gray-900 hover:text-indigo-600">{s.workspace.name}</Link>
                  <div className="text-xs text-gray-500"><code className="bg-gray-100 px-1 rounded">{s.workspace.slug}</code></div>
                </td>
                <td className="px-3 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{s.plan}</span></td>
                <td className="px-3 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[s.status]}`}>{s.status}</span></td>
                <td className="px-3 py-3 text-sm text-gray-700">{s.seatsPurchased}</td>
                <td className="px-3 py-3 text-sm font-semibold text-green-700">₹{(s.pricePerSeatMonthly * s.seatsPurchased).toLocaleString()}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{s.currentPeriodEnd ? format(s.currentPeriodEnd, "MMM d, yyyy") : s.trialEndsAt ? `Trial ends ${format(s.trialEndsAt, "MMM d")}` : "—"}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{s.razorpaySubscriptionId ? <code className="bg-gray-100 px-1 rounded">{s.razorpaySubscriptionId.slice(0, 20)}…</code> : <span className="text-gray-400">stub</span>}</td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-12 text-center text-sm text-gray-500">No subscriptions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: "green" | "indigo" | "blue" }) {
  const tones: Record<string, string> = {
    green: "bg-green-50 text-green-600",
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-2 h-2 rounded-full mb-2 ${tone ? tones[tone].split(" ")[0] : "bg-gray-300"}`} />
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
