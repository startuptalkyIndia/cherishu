import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ValuesAndBadges from "./ValuesAndBadges";

export const dynamic = "force-dynamic";

export default async function ValuesPage() {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!user.workspaceId) return null;

  const [values, badges] = await Promise.all([
    prisma.companyValue.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } }),
    prisma.badge.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Values & Badges</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">The culture building blocks of your workspace.</p>
      <ValuesAndBadges
        values={values.map(v => ({ id: v.id, name: v.name, emoji: v.emoji, description: v.description }))}
        badges={badges.map(b => ({ id: b.id, name: b.name, emoji: b.emoji, color: b.color }))}
      />
    </div>
  );
}
