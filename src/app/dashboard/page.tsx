import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Send, Gift, Trophy, Heart, Coins } from "lucide-react";
import FeedCard from "@/components/FeedCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user.workspaceId) return null;

  const [recognitions, myStats, workspaceStats] = await Promise.all([
    prisma.recognition.findMany({
      where: { workspaceId: user.workspaceId },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        badge: true,
        value: true,
        reactions: { include: { user: { select: { id: true, name: true } } } },
        comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.recognition.aggregate({
      where: { workspaceId: user.workspaceId, receiverId: user.id },
      _sum: { points: true },
      _count: true,
    }),
    prisma.recognition.count({ where: { workspaceId: user.workspaceId } }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here&apos;s what&apos;s happening across your team.</p>
        </div>
        <Link href="/dashboard/send" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Send className="w-4 h-4" /> Send Kudos
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Coins} label="Points to Give" value={user.giveablePoints} tone="indigo" />
        <StatCard icon={Gift} label="Redeemable" value={user.redeemablePoints} tone="green" />
        <StatCard icon={Heart} label="You've Received" value={myStats._sum.points || 0} tone="rose" />
        <StatCard icon={Trophy} label="Workspace Kudos" value={workspaceStats} tone="yellow" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Recognition Feed</h2>

      {recognitions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Be the first to recognize someone</h3>
          <p className="text-sm text-gray-500 mt-1">Send a kudos to start building your team&apos;s culture.</p>
          <Link href="/dashboard/send" className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Send className="w-4 h-4" /> Send your first kudos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recognitions.map((r) => (
            <FeedCard
              key={r.id}
              currentUserId={user.id}
              recognition={{
                id: r.id,
                sender: r.sender, receiver: r.receiver,
                message: r.message, points: r.points,
                badge: r.badge ? { emoji: r.badge.emoji, name: r.badge.name } : null,
                value: r.value ? { emoji: r.value.emoji, name: r.value.name } : null,
                createdAt: r.createdAt.toISOString(),
                isSystem: r.isSystem,
                kind: r.kind,
                reactions: r.reactions.map(x => ({ emoji: x.emoji, userId: x.userId, userName: x.user.name })),
                comments: r.comments.map(c => ({ id: c.id, userId: c.userId, userName: c.user.name, message: c.message, createdAt: c.createdAt.toISOString() })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number | string; tone: "indigo" | "green" | "rose" | "yellow" }) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    rose: "bg-rose-50 text-rose-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
