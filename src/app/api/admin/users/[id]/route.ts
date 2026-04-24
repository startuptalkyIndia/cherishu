import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const { id } = await ctx.params;

  const user = await prisma.user.findFirst({ where: { id, workspaceId: admin.workspaceId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const allowed: any = {};
  if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
  if (typeof body.giveablePoints === "number") allowed.giveablePoints = body.giveablePoints;
  if (typeof body.redeemablePoints === "number") allowed.redeemablePoints = body.redeemablePoints;
  if (body.role && ["EMPLOYEE", "MANAGER", "HR_ADMIN"].includes(body.role)) allowed.role = body.role;
  if (typeof body.jobTitle === "string") allowed.jobTitle = body.jobTitle;
  if (typeof body.department === "string") allowed.department = body.department;
  if (typeof body.birthday === "string") allowed.birthday = body.birthday ? new Date(body.birthday) : null;
  if (typeof body.joinedAt === "string") allowed.joinedAt = new Date(body.joinedAt);

  const updated = await prisma.user.update({ where: { id }, data: allowed });
  return NextResponse.json({ ok: true, user: updated });
}
