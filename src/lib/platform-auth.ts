import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";
import crypto from "crypto";

const COOKIE = "cherishu_pa";

// Resolve the signing secret lazily so we don't crash at module-import time
// during `next build` (when AUTH_SECRET may not be in the build environment).
// The check still fires the first time a token is signed/verified at runtime.
function getSigningSecret(): string {
  const SECRET = process.env.AUTH_SECRET || "";
  if (!SECRET && process.env.NODE_ENV === "production") {
    throw new Error("[platform-auth] AUTH_SECRET env var is required in production");
  }
  // Dev-only fallback — never used in production (the throw above blocks that path).
  return SECRET || "dev-only-insecure-do-not-use-in-production";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
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
