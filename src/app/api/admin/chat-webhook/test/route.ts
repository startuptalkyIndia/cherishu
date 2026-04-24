import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { postToChat, WebhookType } from "@/lib/chat-webhooks";

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  const { type, url } = await req.json();
  if (!type || !url) return NextResponse.json({ error: "Missing type or url" }, { status: 400 });
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
