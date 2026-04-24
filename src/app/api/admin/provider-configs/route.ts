import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const { provider, apiKey, apiSecret, accountId, isEnabled } = await req.json();
  if (!provider) return NextResponse.json({ error: "Provider required" }, { status: 400 });

  const config = await prisma.rewardProviderConfig.upsert({
    where: { workspaceId_provider: { workspaceId: admin.workspaceId, provider } },
    update: { apiKey, apiSecret, accountId, isEnabled: !!isEnabled },
    create: { workspaceId: admin.workspaceId, provider, apiKey, apiSecret, accountId, isEnabled: !!isEnabled },
  });
  return NextResponse.json({ ok: true, config: { provider: config.provider, isEnabled: config.isEnabled, hasKey: !!config.apiKey } });
}
