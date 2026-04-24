import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import UsersTable from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return null;
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 50;
  const q = (sp.q || "").trim();
  const role = sp.role || "";
  const department = sp.department || "";
  const status = sp.status || "";
  const sort = sp.sort || "createdAt-desc";

  const where: any = { workspaceId: admin.workspaceId };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { jobTitle: { contains: q, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (department) where.department = department;
  if (status === "active") where.isActive = true;
  if (status === "disabled") where.isActive = false;

  const orderByMap: Record<string, any> = {
    "createdAt-desc": { createdAt: "desc" },
    "createdAt-asc": { createdAt: "asc" },
    "name-asc": { name: "asc" },
    "redeemable-desc": { redeemablePoints: "desc" },
    "giveable-desc": { giveablePoints: "desc" },
  };
  const orderBy = orderByMap[sort] || orderByMap["createdAt-desc"];

  const [users, total, departments] = await Promise.all([
    prisma.user.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.user.count({ where }),
    prisma.user.findMany({
      where: { workspaceId: admin.workspaceId, department: { not: null } },
      select: { department: true },
      distinct: ["department"],
    }),
  ]);

  const deptOptions = [{ label: "All", value: "" }, ...departments.filter((d) => d.department).map((d) => ({ label: d.department!, value: d.department! }))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your team, roles, and point allocations.</p>
        </div>
      </div>
      <UsersTable
        initialUsers={users.map((u) => ({
          id: u.id, name: u.name, email: u.email, role: u.role, jobTitle: u.jobTitle, department: u.department,
          giveablePoints: u.giveablePoints, redeemablePoints: u.redeemablePoints, isActive: u.isActive,
          birthday: u.birthday?.toISOString().slice(0, 10) || null,
          joinedAt: u.joinedAt.toISOString().slice(0, 10),
          createdAt: u.createdAt.toISOString(),
        }))}
        total={total}
        pageSize={pageSize}
        departments={deptOptions}
      />
    </div>
  );
}
