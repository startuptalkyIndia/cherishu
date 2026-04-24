import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NominateForm from "./NominateForm";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  AWARDED: "bg-green-100 text-green-800",
};

export default async function NominatePage() {
  const user = await requireUser();
  if (!user.workspaceId) return null;

  const [people, mine] = await Promise.all([
    prisma.user.findMany({
      where: { workspaceId: user.workspaceId, isActive: true, id: { not: user.id } },
      select: { id: true, name: true, jobTitle: true },
      orderBy: { name: "asc" },
    }),
    prisma.nomination.findMany({
      where: { workspaceId: user.workspaceId, nominatorId: user.id },
      include: { nominee: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Nominate a Teammate</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Suggest someone for an award. HR admins will review.</p>
      <NominateForm people={people} />

      {mine.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">My Nominations</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {mine.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{n.award}</span>
                    <span className="text-xs text-gray-500">for {n.nominee.name}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{n.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(n.createdAt, { addSuffix: true })}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[n.status]}`}>{n.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
