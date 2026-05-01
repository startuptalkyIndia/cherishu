/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding-window counter per key (IP or identifier).
 *
 * NOTE: This is per-instance; for multi-replica deployments,
 * a shared store (Redis) should replace this.
 * TODO: Replace with Redis-backed rate limiting when scaling beyond a single instance.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export interface RateLimitOptions {
  /** Max number of requests allowed within the window */
  limit: number;
  /** Window size in seconds */
  windowSec: number;
  /** Key to rate-limit on (e.g. IP address, or `ip:email`) */
  key: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit({ limit, windowSec, key }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const existing = store.get(key);
  if (!existing || existing.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  existing.count += 1;
  const allowed = existing.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/**
 * Extract the best-effort IP from a Next.js Request.
 * Respects x-forwarded-for (set by Nginx proxy on the server).
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
