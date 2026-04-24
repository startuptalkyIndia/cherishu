import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 50;
  const q = (sp.q || "").trim();
  const actorType = sp.actorType || "";

  const where: any = {};
  if (actorType) where.actorType = actorType;
  if (q) {
    where.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { target: { contains: q, mode: "insensitive" } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.auditLog.count({ where }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">System events across the platform.</p>

      <FilterBar
        searchPlaceholder="Search by action or target…"
        filters={[
          { key: "actorType", label: "Actor", options: [
            { label: "All", value: "" },
            { label: "User", value: "user" },
            { label: "Platform admin", value: "platform_admin" },
            { label: "System", value: "system" },
          ]},
        ]}
        total={total}
        pageSize={pageSize}
      />

      {total === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
          {q || actorType
            ? <>No events match. <a href="/sup-min/audit" className="text-indigo-600 hover:text-indigo-800 font-medium">Clear filters</a></>
            : "No audit events yet. Events will appear as users interact with the system."}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Action</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Actor</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Target</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Workspace</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{l.action}</code></td>
                  <td className="px-3 py-3 text-sm text-gray-700">{l.actorType}{l.actorId ? ` / ${l.actorId.slice(-6)}` : ""}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{l.target || "—"}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{l.workspaceId?.slice(-6) || "—"}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{formatDistanceToNow(l.createdAt, { addSuffix: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
