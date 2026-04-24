import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!user.workspaceId) return null;

  const [workspace, values, badges] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: user.workspaceId } }),
    prisma.companyValue.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } }),
    prisma.badge.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } }),
  ]);

  if (!workspace) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Customize your culture, values, and budgets.</p>
      <SettingsForm
        workspace={{
          name: workspace.name,
          slug: workspace.slug,
          monthlyBudgetPoints: workspace.monthlyBudgetPoints,
          currency: workspace.currency,
          plan: workspace.plan,
          autoBirthdayEnabled: workspace.autoBirthdayEnabled,
          autoBirthdayPoints: workspace.autoBirthdayPoints,
          autoBirthdayMessage: workspace.autoBirthdayMessage,
          autoAnniversaryEnabled: workspace.autoAnniversaryEnabled,
          autoAnniversaryPoints: workspace.autoAnniversaryPoints,
          autoAnniversaryMessage: workspace.autoAnniversaryMessage,
        }}
        values={values}
        badges={badges}
      />
    </div>
  );
}
