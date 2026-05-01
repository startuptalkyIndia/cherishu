import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  teamSize: z.string().max(20).optional(),
  message: z.string().min(1).max(5000),
  source: z.string().max(100).optional(),
  utmSource: z.string().max(100).optional().nullable(),
  utmMedium: z.string().max(100).optional().nullable(),
  utmCampaign: z.string().max(100).optional().nullable(),
});

export async function POST(req: Request) {
  // Rate limit: 5 leads per hour per IP to prevent spam
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `leads:${ip}`, limit: 5, windowSec: 3600 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const input = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      company: input.company || null,
      teamSize: input.teamSize || null,
      message: input.message,
      source: input.source || null,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
    },
  });

  // Notify sales (fire-and-forget; ignored if no API key)
  sendEmail({
    to: process.env.SALES_EMAIL || "sales@cherishu.talkytools.com",
    subject: `New Cherishu lead: ${input.company || input.name}`,
    html: `
      <h2>New lead from cherishu.talkytools.com</h2>
      <p><strong>Name:</strong> ${escape(input.name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${input.email}">${escape(input.email)}</a></p>
      <p><strong>Company:</strong> ${escape(input.company || "(not given)")}</p>
      <p><strong>Team size:</strong> ${escape(input.teamSize || "(not given)")}</p>
      <p><strong>Source:</strong> ${escape(input.source || "—")}${input.utmSource ? ` · UTM: ${escape(input.utmSource)}/${escape(input.utmMedium || "")}/${escape(input.utmCampaign || "")}` : ""}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 3px solid #4f46e5; padding-left: 12px; margin-left: 0; color: #374151;">${escape(input.message).replace(/\n/g, "<br/>")}</blockquote>
      <p style="color:#6b7280;font-size:13px;">Lead id: ${lead.id} · Reply directly to ${escape(input.email)}.</p>
    `,
    replyTo: input.email,
  }).catch(() => {});

  return NextResponse.json({ ok: true, id: lead.id });
}

function escape(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
