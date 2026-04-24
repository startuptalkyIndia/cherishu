import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Heart, Coins, Award, Gift } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  if (!user.workspaceId) return null;

  const [sent, received, redemptions, received_total] = await Promise.all([
    prisma.recognition.findMany({
      where: { senderId: user.id },
      include: { receiver: { select: { name: true } }, badge: true, value: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.recognition.findMany({
      where: { receiverId: user.id },
      include: { sender: { select: { name: true } }, badge: true, value: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.redemption.findMany({
      where: { userId: user.id },
      include: { reward: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.recognition.aggregate({ where: { receiverId: user.id }, _sum: { points: true }, _count: true }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-semibold">
          {user.name[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email} · {user.jobTitle || "Team member"}{user.department ? ` · ${user.department}` : ""}</p>
          <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{user.role.replace("_", " ")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat icon={Coins} label="Points to Give" value={user.giveablePoints} />
        <Stat icon={Gift} label="Redeemable" value={user.redeemablePoints} />
        <Stat icon={Heart} label="Received" value={received_total._count} />
        <Stat icon={Award} label="Points Earned" value={received_total._sum.points || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Recognitions Received ({received.length})</h3></div>
          {received.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No kudos yet — but your time will come.</div>
          ) : received.map((r) => (
            <div key={r.id} className="px-4 py-3 border-b border-gray-100 last:border-0">
              <div className="text-sm"><span className="font-medium text-gray-900">{r.sender?.name || (r.kind === "birthday" ? "🎂 Birthday" : r.kind === "anniversary" ? "🎉 Anniversary" : "Cherishu")}</span>
                {r.points > 0 && <span className="ml-2 text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium"><Coins className="w-3 h-3" /> +{r.points}</span>}
                {r.badge && <span className="ml-1 text-xs">{r.badge.emoji}</span>}
              </div>
              <p className="text-sm text-gray-700 mt-1">{r.message}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(r.createdAt, { addSuffix: true })}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Recognitions Sent ({sent.length})</h3></div>
          {sent.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">You haven&apos;t sent a kudos yet. Send one now!</div>
          ) : sent.map((r) => (
            <div key={r.id} className="px-4 py-3 border-b border-gray-100 last:border-0">
              <div className="text-sm">to <span className="font-medium text-gray-900">{r.receiver.name}</span>
                {r.points > 0 && <span className="ml-2 text-xs text-indigo-600">+{r.points} pts</span>}
              </div>
              <p className="text-sm text-gray-700 mt-1">{r.message}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(r.createdAt, { addSuffix: true })}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 md:col-span-2">
          <div className="px-4 py-3 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Recent Redemptions</h3></div>
          {redemptions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No redemptions yet.</div>
          ) : redemptions.map((r) => (
            <div key={r.id} className="px-4 py-3 border-b border-gray-100 last:border-0 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{r.reward.name}</div>
                <div className="text-xs text-gray-500">{formatDistanceToNow(r.createdAt, { addSuffix: true })} · {r.pointsSpent} pts</div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon className="w-4 h-4" /></div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
