import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/EmptyState";
import NominationActions from "./NominationActions";

export const dynamic = "force-dynamic";

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
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = nominations.filter(n => n.status === "PENDING").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Nominations
            {pending > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                {pending} pending
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and award nominations from your team.</p>
        </div>
      </div>

      {nominations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            context="Cherishu · Nominations"
            icon="🏆"
            title="No nominations yet"
            reason="When teammates submit nominations, they'll appear here for your review. Managers can submit from the employee dashboard."
            action={{ label: "View employee dashboard", href: "/dashboard/nominate" }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {nominations.map((n) => (
            <div key={n.id} className={`bg-white rounded-xl border p-4 ${n.status === "PENDING" ? "border-yellow-200" : "border-gray-200"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{n.award}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[n.status]}`}>{n.status}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{n.nominator.name}</span> nominated{" "}
                    <span className="font-medium text-gray-900">{n.nominee.name}</span>
                    {n.points > 0 && <span className="text-indigo-600 font-medium"> · {n.points} pts suggested</span>}
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{n.reason}</p>
                  <div className="text-xs text-gray-500 mt-1">{formatDistanceToNow(n.createdAt, { addSuffix: true })}</div>
                </div>
                {n.status === "PENDING" && (
                  <div className="shrink-0">
                    <NominationActions id={n.id} suggestedPoints={n.points} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
