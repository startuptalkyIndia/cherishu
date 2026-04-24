import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

const schema = z.object({
  name: z.string().min(2),
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  plan: z.enum(["free", "pro", "enterprise"]).default("free"),
  budget: z.number().int().min(0).default(10000),
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "workspace";
}

export async function POST(req: Request) {
  await requirePlatformAdmin();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });
  const input = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: input.adminEmail.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Admin email already registered" }, { status: 400 });

  let slug = slugify(input.name);
  let i = 0;
  while (await prisma.workspace.findUnique({ where: { slug } })) {
    i++; slug = `${slugify(input.name)}-${i}`;
  }

  const ws = await prisma.workspace.create({
    data: {
      name: input.name, slug, plan: input.plan, monthlyBudgetPoints: input.budget,
      values: { create: [
        { name: "Customer Obsession", emoji: "🎯" },
        { name: "Ownership", emoji: "💪" },
        { name: "Innovation", emoji: "💡" },
        { name: "Team Spirit", emoji: "🤝" },
      ] },
      badges: { create: [
        { name: "Team Player", emoji: "🤝", color: "indigo" },
        { name: "Above & Beyond", emoji: "🚀", color: "purple" },
        { name: "Innovator", emoji: "💡", color: "yellow" },
        { name: "Customer Hero", emoji: "🏆", color: "green" },
      ] },
    },
  });

  const passwordHash = await bcrypt.hash(input.adminPassword, 10);
  await prisma.user.create({
    data: {
      email: input.adminEmail.toLowerCase(),
      name: input.adminName,
      passwordHash,
      role: "HR_ADMIN",
      workspaceId: ws.id,
      giveablePoints: 1000,
    },
  });

  return NextResponse.json({ ok: true, workspace: ws });
}
