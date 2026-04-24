import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const schema = z.object({
  amount: z.number().int().min(1).max(1000000),
  scope: z.enum(["giveable", "redeemable"]),
});

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const field = parsed.data.scope === "giveable" ? "giveablePoints" : "redeemablePoints";
  const result = await prisma.user.updateMany({
    where: { workspaceId: admin.workspaceId, isActive: true },
    data: { [field]: { increment: parsed.data.amount } },
  });
  return NextResponse.json({ ok: true, updated: result.count });
}
