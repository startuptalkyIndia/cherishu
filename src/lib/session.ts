import { auth } from "./auth";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user) return null;
  const id = (session.user as any).id as string;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { workspace: true },
  });
  // A soft-deleted workspace locks out all of its users (existing sessions included).
  if (user?.workspace?.deletedAt) return null;
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: ("EMPLOYEE" | "MANAGER" | "HR_ADMIN" | "SUPER_ADMIN")[]) {
  const user = await requireUser();
  if (!roles.includes(user.role as any)) redirect("/dashboard");
  return user;
}
