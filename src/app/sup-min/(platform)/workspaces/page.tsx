import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import CreateWorkspaceButton from "./CreateWorkspaceButton";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, recognitions: true, redemptions: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
          <p className="text-sm text-gray-500 mt-0.5">{workspaces.length} total.</p>
        </div>
        <CreateWorkspaceButton />
      </div>

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
              <tr><td colSpan={9} className="px-3 py-10 text-center text-sm text-gray-500">No workspaces yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
