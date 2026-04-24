import { requireRole } from "@/lib/session";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
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
    >
      {children}
    </AppShell>
  );
}
