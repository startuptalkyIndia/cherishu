import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const schema = z.object({
  billingEmail: z.string().email().nullable().optional(),
});

export async function PATCH(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const data: any = {};
  if (parsed.data.billingEmail !== undefined) data.billingEmail = parsed.data.billingEmail || null;
  await prisma.workspace.update({ where: { id: admin.workspaceId }, data });
  return NextResponse.json({ ok: true });
}
