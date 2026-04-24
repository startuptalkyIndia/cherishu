import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { runAutoKudos } from "@/lib/auto-kudos";

export const dynamic = "force-dynamic";

// HR admins can manually trigger auto-kudos for today (useful for testing + first-run)
export async function POST() {
  await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  const result = await runAutoKudos();
  return NextResponse.json({ ok: true, ...result });
}
