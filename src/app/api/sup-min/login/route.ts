import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, makeToken } from "@/lib/platform-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit: 10 attempts per 15 minutes per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `sup-min-login:${ip}`, limit: 10, windowSec: 900 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const { email, password } = body;
  if (!email || !password) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const admin = await prisma.platformAdmin.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!admin) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  await prisma.platformAdmin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

  const token = makeToken(admin.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return res;
}
