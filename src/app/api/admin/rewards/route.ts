import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string(),
  provider: z.string(),
  pointsCost: z.number().int().min(0),
  currencyValue: z.number().optional(),
  currency: z.string().default("INR"),
  featured: z.boolean().optional(),
  providerSku: z.string().optional(),
  category: z.string().optional(),
});

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });
  const input = parsed.data;

  const reward = await prisma.reward.create({
    data: {
      workspaceId: admin.workspaceId,
      name: input.name,
      description: input.description || null,
      type: input.type as any,
      provider: input.provider as any,
      pointsCost: input.pointsCost,
      currencyValue: input.currencyValue ?? null,
      currency: input.currency,
      featured: input.featured || false,
      providerSku: input.providerSku || null,
      category: input.category || null,
    },
  });
  return NextResponse.json({ ok: true, reward: { ...reward, workspaceScoped: true } });
}
