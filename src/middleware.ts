import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple in-process rate limiter for middleware (Edge Runtime compatible).
 * Uses a Map for sliding window counters.
 * NOTE: This resets on cold starts. For production multi-replica deployments,
 * a shared store (e.g. Upstash Redis) should be used instead.
 * TODO: Replace with Upstash Redis-backed rate limiting when scaling.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function middlewareRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  entry.count += 1;
  return entry.count <= limit;
}

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIp(req);

  // Rate-limit NextAuth credential sign-in: 20 attempts per 15 min per IP
  if (pathname === "/api/auth/callback/credentials" && req.method === "POST") {
    const allowed = middlewareRateLimit(`auth:${ip}`, 20, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
    }
  }

  // Noindex for super admin
  if (pathname.startsWith("/sup-min")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sup-min/:path*", "/api/auth/callback/credentials"],
};
