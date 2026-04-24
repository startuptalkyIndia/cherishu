import { NextResponse } from "next/server";
import { runAutoKudos } from "@/lib/auto-kudos";

export const dynamic = "force-dynamic";

/**
 * Daily cron endpoint. Protected by CRON_SECRET.
 * Call with: curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/auto-kudos
 * Also accepts ?key=$CRON_SECRET query param for simple cron entries.
 */
export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured on server" }, { status: 500 });

  const authHeader = req.headers.get("authorization") || "";
  const url = new URL(req.url);
  const queryKey = url.searchParams.get("key") || "";
  const ok = authHeader === `Bearer ${secret}` || queryKey === secret;
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await runAutoKudos();
  return NextResponse.json({ ok: true, ...result });
}
