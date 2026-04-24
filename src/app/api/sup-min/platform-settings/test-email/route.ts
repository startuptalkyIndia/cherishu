import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  await requirePlatformAdmin();
  const { to } = await req.json();
  if (!to) return NextResponse.json({ error: "Missing recipient" }, { status: 400 });
  const result = await sendEmail({
    to,
    subject: "Cherishu test email 🎉",
    html: `<p style="font-family:sans-serif;">If you're reading this, email from Cherishu is working. You're all set.</p>
           <p style="font-family:sans-serif;color:#6b7280;font-size:13px;">Sent at ${new Date().toISOString()}</p>`,
    text: "Cherishu test email. Email from Cherishu is working.",
  });
  return NextResponse.json(result);
}
