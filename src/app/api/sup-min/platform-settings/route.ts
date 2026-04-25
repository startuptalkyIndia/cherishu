import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

const ALLOWED_KEYS = new Set([
  "resend_api_key", "email_from", "email_base_url",
  "razorpay_key_id", "razorpay_key_secret", "razorpay_webhook_secret", "razorpay_plan_pro",
]);

export async function PATCH(req: Request) {
  await requirePlatformAdmin();
  const body = await req.json();
  const ops = [];
  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    ops.push(prisma.platformSetting.upsert({
      where: { key },
      update: { value: String(value || "") },
      create: { key, value: String(value || "") },
    }));
  }
  await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
