import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";
import crypto from "crypto";

const COOKIE = "cherishu_pa";
const SECRET = process.env.AUTH_SECRET || "";

if (!SECRET && process.env.NODE_ENV === "production") {
  // Crash loudly in production — platform tokens cannot be signed with an empty secret
  throw new Error("[platform-auth] AUTH_SECRET env var is required in production");
}

// Use a non-empty fallback only in development (never in production)
const SIGNING_SECRET = SECRET || "dev-only-insecure-do-not-use-in-production";

function sign(payload: string) {
  return crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
}

export function makeToken(adminId: string) {
  const exp = Date.now() + 24 * 60 * 60 * 1000;
  const payload = `${adminId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token?: string | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  if (Number(exp) < Date.now()) return null;
  const expected = sign(`${id}.${exp}`);
  if (sig !== expected) return null;
  return id;
}

export async function getPlatformAdmin() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const id = verifyToken(token);
  if (!id) return null;
  return prisma.platformAdmin.findUnique({ where: { id } });
}

export async function requirePlatformAdmin() {
  const admin = await getPlatformAdmin();
  if (!admin) redirect("/sup-min");
  return admin;
}

export const COOKIE_NAME = COOKIE;
