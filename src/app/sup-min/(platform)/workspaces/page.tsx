import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CreateWorkspaceButton from "./CreateWorkspaceButton";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 30;
  const q = (sp.q || "").trim();
  const plan = sp.plan || "";
  const sort = sp.sort || "createdAt-desc";

  const where: any = {};
  if (plan) where.plan = plan;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderByMap: Record<string, any> = {
    "createdAt-desc": { createdAt: "desc" },
    "createdAt-asc": { createdAt: "asc" },
    "name-asc": { name: "asc" },
    "users-desc": { users: { _count: "desc" } },
    "kudos-desc": { recognitions: { _count: "desc" } },
  };
  const orderBy = orderByMap[sort] || orderByMap["createdAt-desc"];

  const [workspaces, total] = await Promise.all([
    prisma.workspace.findMany({
      where, orderBy,
      skip: (page - 1) * pageSize, take: pageSize,
      include: { _count: { select: { users: true, recognitions: true, redemptions: true } } },
    }),
    prisma.workspace.count({ where }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total across the platform.</p>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Search by name or slug…"
        filters={[
          { key: "plan", label: "Plan", options: [
            { label: "All", value: "" },
            { label: "Free", value: "free" },
            { label: "Pro", value: "pro" },
            { label: "Enterprise", value: "enterprise" },
          ]},
        ]}
        sort={{ key: "sort", label: "Sort", options: [
          { label: "Newest", value: "createdAt-desc" },
          { label: "Oldest", value: "createdAt-asc" },
          { label: "Name A→Z", value: "name-asc" },
          { label: "Most users", value: "users-desc" },
          { label: "Most kudos", value: "kudos-desc" },
        ]}}
        total={total}
        pageSize={pageSize}
      >
        <CreateWorkspaceButton />
      </FilterBar>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Name</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Slug</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Plan</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Budget</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Users</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Kudos</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Redeems</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Created</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {workspaces.map((w) => (
              <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm text-gray-900 font-medium">{w.name}</td>
                <td className="px-3 py-3 text-sm text-gray-700"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{w.slug}</code></td>
                <td className="px-3 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{w.plan}</span></td>
                <td className="px-3 py-3 text-sm text-gray-700">{w.monthlyBudgetPoints.toLocaleString()}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{w._count.users}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{w._count.recognitions}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{w._count.redemptions}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{w.createdAt.toLocaleDateString()}</td>
                <td className="px-3 py-3 text-right">
                  <Link href={`/sup-min/workspaces/${w.id}`} className="text-xs text-indigo-600 hover:text-indigo-800">Manage →</Link>
                </td>
              </tr>
            ))}
            {workspaces.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-12 text-center text-sm text-gray-500">
                {q || plan
                  ? <>No workspaces match. <Link href="/sup-min/workspaces" className="text-indigo-600 hover:text-indigo-800 font-medium">Clear filters</Link></>
                  : "No workspaces yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
