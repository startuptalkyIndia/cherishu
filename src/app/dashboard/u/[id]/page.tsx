import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Send, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const current = await requireUser();
  if (!current.workspaceId) return null;
  const { id } = await params;

  const user = await prisma.user.findFirst({ where: { id, workspaceId: current.workspaceId } });
  if (!user) return notFound();

  const [received, sent, totals] = await Promise.all([
    prisma.recognition.findMany({
      where: { receiverId: id, workspaceId: current.workspaceId },
      include: { sender: { select: { name: true } }, badge: true, value: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.recognition.findMany({
      where: { senderId: id, workspaceId: current.workspaceId },
      include: { receiver: { select: { name: true } }, badge: true, value: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.recognition.aggregate({ where: { receiverId: id, workspaceId: current.workspaceId }, _sum: { points: true }, _count: true }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to feed
      </Link>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-semibold">
            {user.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.jobTitle || "Team member"}{user.department ? ` · ${user.department}` : ""}</p>
            <p className="text-xs text-gray-500 mt-1">{totals._count} kudos · {totals._sum.points || 0} points earned</p>
          </div>
        </div>
        {user.id !== current.id && (
          <Link href={`/dashboard/send?to=${user.id}`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
            <Send className="w-4 h-4" /> Send Kudos
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Received ({received.length})</h3></div>
          {received.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No kudos received yet.</div>
          ) : received.map((r) => (
            <div key={r.id} className="px-4 py-3 border-b border-gray-100 last:border-0">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{r.sender?.name || (r.kind === "birthday" ? "🎂 Birthday" : r.kind === "anniversary" ? "🎉 Anniversary" : "Cherishu")}</span>
                {r.points > 0 && <span className="ml-2 text-xs text-indigo-600 font-medium">+{r.points} pts</span>}
                {r.badge && <span className="ml-1 text-xs">{r.badge.emoji} {r.badge.name}</span>}
              </div>
              <p className="text-sm text-gray-700 mt-1">{r.message}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(r.createdAt, { addSuffix: true })}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Sent ({sent.length})</h3></div>
          {sent.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No kudos sent yet.</div>
          ) : sent.map((r) => (
            <div key={r.id} className="px-4 py-3 border-b border-gray-100 last:border-0">
              <div className="text-sm">to <span className="font-medium text-gray-900">{r.receiver.name}</span>
                {r.points > 0 && <span className="ml-2 text-xs text-indigo-600 font-medium">+{r.points} pts</span>}
              </div>
              <p className="text-sm text-gray-700 mt-1">{r.message}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(r.createdAt, { addSuffix: true })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
