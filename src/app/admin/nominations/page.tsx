import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  AWARDED: "bg-green-100 text-green-800",
};

export default async function NominationsPage() {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!user.workspaceId) return null;

  const nominations = await prisma.nomination.findMany({
    where: { workspaceId: user.workspaceId },
    include: { nominator: { select: { name: true } }, nominee: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Nominations</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Review nominations for awards like Employee of the Month.</p>

      {nominations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
          No nominations yet. Managers can submit nominations from their dashboard.
        </div>
      ) : (
        <div className="space-y-3">
          {nominations.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{n.award}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[n.status]}`}>{n.status}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{n.nominator.name}</span> nominated{" "}
                    <span className="font-medium">{n.nominee.name}</span>
                    {n.points > 0 && <> · {n.points} pts</>}
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{n.reason}</p>
                  <div className="text-xs text-gray-500 mt-1">{formatDistanceToNow(n.createdAt, { addSuffix: true })}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
