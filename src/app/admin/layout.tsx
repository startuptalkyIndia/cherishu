import { requireRole } from "@/lib/session";
import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);

  const pendingNominations = user.workspaceId
    ? await prisma.nomination.count({ where: { workspaceId: user.workspaceId, status: "PENDING" } })
    : 0;

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceName: user.workspace?.name,
        giveablePoints: user.giveablePoints,
        redeemablePoints: user.redeemablePoints,
      }}
      section="admin"
      pendingNominations={pendingNominations}
    >
      {children}
    </AppShell>
  );
}
