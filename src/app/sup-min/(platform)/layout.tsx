import { requirePlatformAdmin } from "@/lib/platform-auth";
import SupMinShell from "@/components/SupMinShell";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const admin = await requirePlatformAdmin();
  return <SupMinShell adminEmail={admin.email}>{children}</SupMinShell>;
}
