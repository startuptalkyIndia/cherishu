import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { auditUser } from "@/lib/audit";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const { id } = await ctx.params;

  const user = await prisma.user.findFirst({ where: { id, workspaceId: admin.workspaceId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const allowed: any = {};
  if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
  if (typeof body.giveablePoints === "number" && body.giveablePoints >= 0) allowed.giveablePoints = Math.floor(body.giveablePoints);
  if (typeof body.redeemablePoints === "number" && body.redeemablePoints >= 0) allowed.redeemablePoints = Math.floor(body.redeemablePoints);
  if (body.role && ["EMPLOYEE", "MANAGER", "HR_ADMIN"].includes(body.role)) allowed.role = body.role;
  if (typeof body.jobTitle === "string") allowed.jobTitle = body.jobTitle.slice(0, 200) || null;
  if (typeof body.department === "string") allowed.department = body.department.slice(0, 200) || null;
  if (typeof body.birthday === "string") {
    if (body.birthday === "") {
      allowed.birthday = null;
    } else {
      const d = new Date(body.birthday);
      if (isNaN(d.getTime())) return NextResponse.json({ error: "Invalid birthday date" }, { status: 400 });
      allowed.birthday = d;
    }
  }
  if (typeof body.joinedAt === "string") {
    const d = new Date(body.joinedAt);
    if (isNaN(d.getTime())) return NextResponse.json({ error: "Invalid joinedAt date" }, { status: 400 });
    allowed.joinedAt = d;
  }

  const updated = await prisma.user.update({ where: { id }, data: allowed });

  // Audit each meaningful change
  if (typeof allowed.isActive === "boolean") {
    auditUser(allowed.isActive ? "enabled" : "disabled", { workspaceId: admin.workspaceId, actorId: admin.id, targetUserId: id });
  }
  if (allowed.role && allowed.role !== user.role) {
    auditUser("role_changed", { workspaceId: admin.workspaceId, actorId: admin.id, targetUserId: id, metadata: { from: user.role, to: allowed.role } });
  }
  if (typeof allowed.giveablePoints === "number" || typeof allowed.redeemablePoints === "number") {
    auditUser("points_adjusted", {
      workspaceId: admin.workspaceId, actorId: admin.id, targetUserId: id,
      metadata: { giveable: allowed.giveablePoints, redeemable: allowed.redeemablePoints },
    });
  }

  return NextResponse.json({ ok: true, user: updated });
}
