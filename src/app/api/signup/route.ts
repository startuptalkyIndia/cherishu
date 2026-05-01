import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { emailWelcome } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  companyName: z.string().min(2).max(80),
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "workspace";
}

export async function POST(req: Request) {
  // Rate limit: 5 signups per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `signup:${ip}`, limit: 5, windowSec: 3600 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const input = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    let slug = slugify(input.companyName);
    let i = 0;
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      i++;
      slug = `${slugify(input.companyName)}-${i}`;
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const workspace = await prisma.workspace.create({
      data: {
        name: input.companyName,
        slug,
        values: {
          create: [
            { name: "Customer Obsession", emoji: "🎯", description: "We put customers first, always." },
            { name: "Ownership", emoji: "💪", description: "We own outcomes, not just tasks." },
            { name: "Innovation", emoji: "💡", description: "We challenge status quo." },
            { name: "Team Spirit", emoji: "🤝", description: "We win as a team." },
          ],
        },
        badges: {
          create: [
            { name: "Team Player", emoji: "🤝", color: "indigo" },
            { name: "Above & Beyond", emoji: "🚀", color: "purple" },
            { name: "Innovator", emoji: "💡", color: "yellow" },
            { name: "Customer Hero", emoji: "🏆", color: "green" },
          ],
        },
      },
    });

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash,
        role: "HR_ADMIN", // first user = HR admin
        workspaceId: workspace.id,
        giveablePoints: 1000,
      },
    });

    // Fire-and-forget welcome email
    emailWelcome({ email: user.email, name: user.name, workspaceName: workspace.name }).catch(() => {});

    return NextResponse.json({ ok: true, userId: user.id, workspaceId: workspace.id });
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: err.issues[0]?.message || "Invalid input" }, { status: 400 });
    // Log only the message, not the full error object, to avoid leaking stack traces
    console.error("[signup-error]", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
