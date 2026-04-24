import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!user.workspaceId) return null;
  const users = await prisma.user.findMany({
    where: { workspaceId: user.workspaceId },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your team, roles, and point allocations.</p>
        </div>
      </div>
      <UsersTable initialUsers={users.map((u) => ({
        id: u.id, name: u.name, email: u.email, role: u.role, jobTitle: u.jobTitle, department: u.department,
        giveablePoints: u.giveablePoints, redeemablePoints: u.redeemablePoints, isActive: u.isActive,
        birthday: u.birthday?.toISOString().slice(0, 10) || null,
        joinedAt: u.joinedAt.toISOString().slice(0, 10),
        createdAt: u.createdAt.toISOString(),
      }))} />
    </div>
  );
}
