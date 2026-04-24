import { requireUser } from "@/lib/session";
import AppShell from "@/components/AppShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
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
      section="employee"
    >
      {children}
    </AppShell>
  );
}
