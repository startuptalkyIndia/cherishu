import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function PATCH(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.monthlyBudgetPoints === "number") data.monthlyBudgetPoints = body.monthlyBudgetPoints;
  if (typeof body.currency === "string") data.currency = body.currency;
  if (typeof body.autoBirthdayEnabled === "boolean") data.autoBirthdayEnabled = body.autoBirthdayEnabled;
  if (typeof body.autoBirthdayPoints === "number") data.autoBirthdayPoints = body.autoBirthdayPoints;
  if (typeof body.autoBirthdayMessage === "string") data.autoBirthdayMessage = body.autoBirthdayMessage;
  if (typeof body.autoAnniversaryEnabled === "boolean") data.autoAnniversaryEnabled = body.autoAnniversaryEnabled;
  if (typeof body.autoAnniversaryPoints === "number") data.autoAnniversaryPoints = body.autoAnniversaryPoints;
  if (typeof body.autoAnniversaryMessage === "string") data.autoAnniversaryMessage = body.autoAnniversaryMessage;

  const ws = await prisma.workspace.update({ where: { id: admin.workspaceId }, data });
  return NextResponse.json({ ok: true, workspace: ws });
}
