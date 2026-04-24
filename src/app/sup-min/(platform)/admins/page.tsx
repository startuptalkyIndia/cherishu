import { prisma } from "@/lib/prisma";
import AdminsAdmin from "./AdminsAdmin";

export const dynamic = "force-dynamic";

export default async function PlatformAdminsPage() {
  const admins = await prisma.platformAdmin.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Admins</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Manage who has super admin access.</p>
      <AdminsAdmin initial={admins.map(a => ({ id: a.id, name: a.name, email: a.email, lastLoginAt: a.lastLoginAt?.toISOString() || null, createdAt: a.createdAt.toISOString() }))} />
    </div>
  );
}
