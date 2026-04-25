import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { auditMerchant } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(80),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  commissionPercent: z.number().min(0).max(100),
  handoffMethod: z.enum(["email", "webhook", "manual"]),
  webhookUrl: z.string().optional(),
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "merchant";
}

export async function POST(req: Request) {
  const admin = await requirePlatformAdmin();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });
  const input = parsed.data;

  let slug = slugify(input.name);
  let i = 0;
  while (await prisma.merchant.findUnique({ where: { slug } })) {
    i++; slug = `${slugify(input.name)}-${i}`;
  }

  const merchant = await prisma.merchant.create({
    data: {
      name: input.name,
      slug,
      contactEmail: input.contactEmail.toLowerCase(),
      contactPhone: input.contactPhone || null,
      commissionPercent: input.commissionPercent,
      handoffMethod: input.handoffMethod,
      webhookUrl: input.webhookUrl || null,
    },
  });
  auditMerchant("created", { actorId: admin.id, merchantId: merchant.id, metadata: { name: merchant.name, commission: merchant.commissionPercent } });

  return NextResponse.json({
    ok: true,
    merchant: {
      id: merchant.id, name: merchant.name, slug: merchant.slug,
      contactEmail: merchant.contactEmail, commissionPercent: merchant.commissionPercent,
      handoffMethod: merchant.handoffMethod, isActive: merchant.isActive,
      rewardCount: 0, redemptionCount: 0, earnings: 0,
    },
  });
}
