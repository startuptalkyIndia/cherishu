import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { sendEmail } from "@/lib/email";

const schema = z.object({ to: z.string().email() });

export async function POST(req: Request) {
  await requirePlatformAdmin();
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid or missing recipient email" }, { status: 400 });
  const { to } = parsed.data;
  const result = await sendEmail({
    to,
    subject: "Cherishu test email 🎉",
    html: `<p style="font-family:sans-serif;">If you're reading this, email from Cherishu is working. You're all set.</p>
           <p style="font-family:sans-serif;color:#6b7280;font-size:13px;">Sent at ${new Date().toISOString()}</p>`,
    text: "Cherishu test email. Email from Cherishu is working.",
  });
  return NextResponse.json(result);
}
