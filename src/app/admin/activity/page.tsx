import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  "user.invited":              { label: "User invited",           color: "bg-blue-100 text-blue-800" },
  "user.disabled":             { label: "User disabled",          color: "bg-yellow-100 text-yellow-800" },
  "user.enabled":              { label: "User re-enabled",        color: "bg-green-100 text-green-800" },
  "user.role_changed":         { label: "Role changed",           color: "bg-purple-100 text-purple-800" },
  "user.points_adjusted":      { label: "Points adjusted",        color: "bg-indigo-100 text-indigo-800" },
  "reward.created":            { label: "Reward added",           color: "bg-blue-100 text-blue-800" },
  "reward.deleted":            { label: "Reward deleted",         color: "bg-red-100 text-red-800" },
  "reward.activated":          { label: "Reward activated",       color: "bg-green-100 text-green-800" },
  "reward.deactivated":        { label: "Reward deactivated",     color: "bg-yellow-100 text-yellow-800" },
  "redemption.fulfilled":      { label: "Redemption fulfilled",   color: "bg-green-100 text-green-800" },
  "redemption.cancelled":      { label: "Redemption cancelled",   color: "bg-red-100 text-red-800" },
  "workspace.settings_updated":{ label: "Settings updated",       color: "bg-gray-100 text-gray-700" },
  "workspace.plan_changed":    { label: "Plan changed",           color: "bg-indigo-100 text-indigo-800" },
  "workspace.auto_kudos_toggled": { label: "Auto-kudos updated",  color: "bg-pink-100 text-pink-800" },
  "workspace.email_settings_updated": { label: "Email prefs updated", color: "bg-blue-100 text-blue-800" },
  "workspace.chat_webhook_updated": { label: "Chat webhook updated", color: "bg-blue-100 text-blue-800" },
  "nomination.submitted":      { label: "Nomination submitted",   color: "bg-blue-100 text-blue-800" },
  "nomination.approved":       { label: "Nomination approved",    color: "bg-green-100 text-green-800" },
  "nomination.awarded":        { label: "Nomination awarded",     color: "bg-green-100 text-green-800" },
  "nomination.rejected":       { label: "Nomination rejected",    color: "bg-red-100 text-red-800" },
};

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return null;
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 50;
  const q = (sp.q || "").trim();
  const category = sp.category || "";

  const where: any = { workspaceId: admin.workspaceId };
  if (q) {
    where.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { target: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.action = { startsWith: `${category}.` };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.auditLog.count({ where }),
  ]);

  // Resolve actor + target user names in batch
  const actorIds = logs.map(l => l.actorId).filter((x): x is string => !!x);
  const targetIds = logs.map(l => l.target).filter((x): x is string => !!x);
  const userMap = new Map<string, string>();
  if (actorIds.length || targetIds.length) {
    const users = await prisma.user.findMany({
      where: { id: { in: [...new Set([...actorIds, ...targetIds])] }, workspaceId: admin.workspaceId },
      select: { id: true, name: true, email: true },
    });
    users.forEach(u => userMap.set(u.id, u.name));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Every important change in your workspace.</p>

      <FilterBar
        searchPlaceholder="Search action or target id…"
        filters={[
          { key: "category", label: "Category", options: [
            { label: "All", value: "" },
            { label: "Users", value: "user" },
            { label: "Rewards", value: "reward" },
            { label: "Redemptions", value: "redemption" },
            { label: "Workspace", value: "workspace" },
            { label: "Nominations", value: "nomination" },
          ]},
        ]}
        total={total}
        pageSize={pageSize}
      />

      {total === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
          {q || category
            ? <>No activity matches. <a href="/admin/activity" className="text-indigo-600 hover:text-indigo-800 font-medium">Clear filters</a></>
            : "No activity logged yet. Changes will appear here as you make them."}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Action</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Actor</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Target</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Details</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const actor = l.actorId ? userMap.get(l.actorId) : null;
                const target = l.target ? userMap.get(l.target) : null;
                const meta = ACTION_LABELS[l.action] || { label: l.action, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span></td>
                    <td className="px-3 py-3 text-sm text-gray-700">{actor || (l.actorType === "system" ? "System" : "—")}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{target || (l.target ? <code className="text-xs bg-gray-100 px-1 rounded">{l.target.slice(-8)}</code> : "—")}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-xs truncate">
                      {l.metadata ? JSON.stringify(l.metadata).slice(0, 80) : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDistanceToNow(l.createdAt, { addSuffix: true })}</td>
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
