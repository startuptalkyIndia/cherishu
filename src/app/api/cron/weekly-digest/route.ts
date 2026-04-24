import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailWeeklyDigest } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) { return handle(req); }
export async function GET(req: Request) { return handle(req); }

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  const authHeader = req.headers.get("authorization") || "";
  const url = new URL(req.url);
  const queryKey = url.searchParams.get("key") || "";
  if (authHeader !== `Bearer ${secret}` && queryKey !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const since = new Date(now); since.setDate(since.getDate() - 7); since.setUTCHours(0, 0, 0, 0);
  const period = `${since.toLocaleDateString("en-GB", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`;

  const workspaces = await prisma.workspace.findMany({ where: { emailWeeklyDigest: true } });
  let sent = 0;

  for (const ws of workspaces) {
    const [totalKudos, pointsAgg, topReceivers, topValue] = await Promise.all([
      prisma.recognition.count({ where: { workspaceId: ws.id, createdAt: { gte: since } } }),
      prisma.recognition.aggregate({ where: { workspaceId: ws.id, createdAt: { gte: since } }, _sum: { points: true } }),
      prisma.recognition.groupBy({
        by: ["receiverId"],
        where: { workspaceId: ws.id, createdAt: { gte: since } },
        _sum: { points: true },
        _count: true,
        orderBy: { _sum: { points: "desc" } },
        take: 5,
      }),
      prisma.recognition.groupBy({
        by: ["valueId"],
        where: { workspaceId: ws.id, valueId: { not: null }, createdAt: { gte: since } },
        _count: true,
        orderBy: { _count: { valueId: "desc" } },
        take: 1,
      }),
    ]);
    if (totalKudos === 0) continue; // skip silent weeks

    const receiverIds = topReceivers.map((r) => r.receiverId);
    const users = await prisma.user.findMany({ where: { id: { in: receiverIds } }, select: { id: true, name: true } });
    const userMap = new Map(users.map((u) => [u.id, u.name]));
    const topValueName = topValue[0]?.valueId ? (await prisma.companyValue.findUnique({ where: { id: topValue[0].valueId } }))?.name : undefined;

    const hrAdmins = await prisma.user.findMany({
      where: { workspaceId: ws.id, role: "HR_ADMIN", isActive: true },
      select: { email: true },
    });
    if (hrAdmins.length === 0) continue;

    await emailWeeklyDigest({
      to: hrAdmins.map((a) => a.email),
      workspaceName: ws.name,
      period,
      totalKudos,
      totalPoints: pointsAgg._sum.points || 0,
      topReceivers: topReceivers.map((r) => ({ name: userMap.get(r.receiverId) || "Unknown", points: r._sum.points || 0 })),
      topValue: topValueName,
    });
    sent++;
  }

  return NextResponse.json({ ok: true, sent, totalWorkspaces: workspaces.length });
}
