import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  await requirePlatformAdmin();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });
  const input = parsed.data;
  const existing = await prisma.platformAdmin.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Email exists" }, { status: 400 });
  const passwordHash = await bcrypt.hash(input.password, 10);
  const admin = await prisma.platformAdmin.create({
    data: { name: input.name, email: input.email.toLowerCase(), passwordHash },
  });
  return NextResponse.json({ ok: true, admin: { id: admin.id, name: admin.name, email: admin.email, lastLoginAt: null, createdAt: admin.createdAt.toISOString() } });
}
