import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import SendKudosForm from "./SendKudosForm";

export const dynamic = "force-dynamic";

export default async function SendPage({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const user = await requireUser();
  if (!user.workspaceId) return null;
  const sp = await searchParams;

  const [people, badges, values] = await Promise.all([
    prisma.user.findMany({
      where: { workspaceId: user.workspaceId, isActive: true, id: { not: user.id } },
      select: { id: true, name: true, email: true, avatarUrl: true, jobTitle: true },
      orderBy: { name: "asc" },
    }),
    prisma.badge.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } }),
    prisma.companyValue.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Send Kudos</h1>
      <p className="text-sm text-gray-500 mb-6">Recognize a teammate&apos;s awesome work. You have <span className="font-semibold text-indigo-600">{user.giveablePoints} pts</span> to give.</p>
      {people.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="text-5xl mb-3">👥</div>
          <h3 className="text-lg font-semibold text-gray-900">No teammates yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Ask your HR admin to add more team members to the workspace.</p>
        </div>
      ) : (
        <SendKudosForm
          people={people}
          badges={badges}
          values={values}
          giveablePoints={user.giveablePoints}
          defaultReceiver={sp.to}
        />
      )}
    </div>
  );
}
