import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/session";
import { postToChat, WebhookType } from "@/lib/chat-webhooks";

const ALLOWED_TYPES = ["slack", "teams", "discord", "generic"];

const schema = z.object({
  type: z.enum(ALLOWED_TYPES as [string, ...string[]]),
  // Only allow https:// URLs to prevent SSRF to internal services
  url: z.string().url().startsWith("https://").max(500),
});

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Missing or invalid type/url" }, { status: 400 });
  const { type, url } = parsed.data;
  const result = await postToChat(type as WebhookType, url, {
    kind: "kudos",
    workspaceName: admin.workspace?.name || "Your workspace",
    senderName: admin.name,
    receiverName: "Test Recipient",
    message: "This is a test message from Cherishu. If you see this in your chat, your webhook integration is working! 🎉",
    points: 100,
    badge: "Above & Beyond",
    value: "Team Spirit",
    baseUrl: process.env.NEXTAUTH_URL || "https://cherishu.talkytools.com",
  });
  return NextResponse.json(result);
}
