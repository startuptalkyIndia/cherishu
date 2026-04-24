import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import SendKudosForm from "./SendKudosForm";

export default async function SendPage() {
  const user = await requireUser();
  if (!user.workspaceId) return null;

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
      <p className="text-sm text-gray-500 mb-6">Recognize a teammate&apos;s awesome work.</p>
      <SendKudosForm
        people={people}
        badges={badges}
        values={values}
        giveablePoints={user.giveablePoints}
      />
    </div>
  );
}
