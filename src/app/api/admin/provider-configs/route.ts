import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

// Only allow known provider identifiers to prevent arbitrary string injection
const KNOWN_PROVIDERS = ["AMAZON", "FLIPKART", "XOXODAY", "QWIKCILVER", "HAPTIK", "MARKETPLACE", "MANUAL", "CUSTOM"];

const schema = z.object({
  provider: z.string().min(1).max(50).refine(
    (v) => KNOWN_PROVIDERS.includes(v.toUpperCase()) || /^[A-Z0-9_]+$/.test(v.toUpperCase()),
    { message: "Invalid provider identifier" }
  ),
  apiKey: z.string().max(500).optional().nullable(),
  apiSecret: z.string().max(500).optional().nullable(),
  accountId: z.string().max(200).optional().nullable(),
  isEnabled: z.boolean().optional(),
});

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const { provider, apiKey, apiSecret, accountId, isEnabled } = parsed.data;

  const config = await prisma.rewardProviderConfig.upsert({
    where: { workspaceId_provider: { workspaceId: admin.workspaceId, provider: provider as any } },
    update: { apiKey, apiSecret, accountId, isEnabled: !!isEnabled },
    create: { workspaceId: admin.workspaceId, provider: provider as any, apiKey, apiSecret, accountId, isEnabled: !!isEnabled },
  });
  return NextResponse.json({ ok: true, config: { provider: config.provider, isEnabled: config.isEnabled, hasKey: !!config.apiKey } });
}
