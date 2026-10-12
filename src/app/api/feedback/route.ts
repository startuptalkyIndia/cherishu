// From _shared/templates/api/feedback-route.ts — Prisma persistence + optional ntfy push.
// A DB failure returns 500 (the widget then tells the user it failed). Rate limit keys on
// X-Real-IP (set by our nginx), not the client-controlled first X-Forwarded-For hop.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATINGS = ["happy", "neutral", "sad"] as const;
type Rating = (typeof RATINGS)[number];

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

// 5 posts/min per client IP; map is swept when it grows so it cannot leak.
const hits = new Map<string, { n: number; reset: number }>();
function allowed(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    if (hits.size > 5000) hits.clear();
  }
  const e = hits.get(ip);
  if (!e || e.reset < now) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return true;
  }
  e.n += 1;
  return e.n <= 5;
}

const NTFY_TOPIC = process.env.NTFY_FEEDBACK_TOPIC || "";

export async function POST(req: Request) {
  if (!allowed(req.headers.get("x-real-ip") ?? "unknown")) {
    return NextResponse.json({ data: null, error: "Too many requests." }, { status: 429 });
  }
  const raw = await req.text();
  if (raw.length > 5000) {
    return NextResponse.json({ data: null, error: "Invalid feedback payload." }, { status: 413 });
  }
  let body: Record<string, unknown> | null = null;
  try { body = JSON.parse(raw) as Record<string, unknown>; } catch { body = null; }
  const rating = body?.rating as Rating;
  if (!RATINGS.includes(rating)) {
    return NextResponse.json({ data: null, error: "Invalid feedback payload." }, { status: 400 });
  }
  const message = str(body?.message, 500);
  const path = str(body?.path, 200);
  const product = str(body?.product, 60);
  const userAgent = str(body?.userAgent, 200);

  try {
    await prisma.feedback.create({ data: { rating, message, path, product, userAgent } });
  } catch (e) {
    console.error("feedback save failed", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ data: null, error: "Could not save feedback." }, { status: 500 });
  }

  if (NTFY_TOPIC) {
    const emoji = rating === "sad" ? "☹️" : rating === "neutral" ? "😐" : "😊";
    fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: { Title: `${emoji} Cherishu feedback`, Tags: rating === "sad" ? "warning" : "speech_balloon" },
      body: message || "(no message)",
    }).catch(() => {});
  }
  return NextResponse.json({ data: { ok: true }, error: null });
}
