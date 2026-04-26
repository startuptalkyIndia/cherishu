import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint.
 * Used by Docker healthcheck and external uptime monitors.
 *
 * Returns 200 if the app is running and the DB is reachable.
 * Returns 503 if the DB is unreachable so Docker can mark the container unhealthy.
 */
export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        timestamp: Date.now(),
        db: "connected",
        latencyMs: Date.now() - start,
        service: "cherishu",
        version: process.env.npm_package_version || "0.1.0",
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: Date.now(),
        db: "unreachable",
        error: e?.message || "DB error",
        service: "cherishu",
      },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
