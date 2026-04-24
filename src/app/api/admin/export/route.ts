import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: any[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map(h => csvEscape(r[h])).join(","));
  return lines.join("\n");
}

export async function GET(req: Request) {
  const user = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!user.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  if (type === "recognitions") {
    const rows = await prisma.recognition.findMany({
      where: { workspaceId: user.workspaceId },
      include: { sender: { select: { email: true, name: true } }, receiver: { select: { email: true, name: true } }, badge: true, value: true },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    const csv = toCsv(rows.map(r => ({
      date: r.createdAt.toISOString(),
      sender_name: r.sender?.name || "(system)", sender_email: r.sender?.email || "",
      receiver_name: r.receiver.name, receiver_email: r.receiver.email,
      points: r.points, badge: r.badge?.name || "", value: r.value?.name || "",
      is_system: r.isSystem ? "yes" : "no", kind: r.kind || "",
      message: r.message,
    })));
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="recognitions-${Date.now()}.csv"` },
    });
  }

  if (type === "redemptions") {
    const rows = await prisma.redemption.findMany({
      where: { workspaceId: user.workspaceId },
      include: { user: { select: { email: true, name: true } }, reward: { select: { name: true, type: true } } },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    const csv = toCsv(rows.map(r => ({
      date: r.createdAt.toISOString(),
      user_name: r.user.name, user_email: r.user.email,
      reward: r.reward.name, reward_type: r.reward.type,
      points_spent: r.pointsSpent, status: r.status,
      voucher_code: r.voucherCode || "", provider_ref: r.providerRef || "",
      fulfilled_at: r.fulfilledAt?.toISOString() || "",
    })));
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="redemptions-${Date.now()}.csv"` },
    });
  }

  if (type === "users") {
    const rows = await prisma.user.findMany({
      where: { workspaceId: user.workspaceId },
      orderBy: { createdAt: "desc" },
    });
    const csv = toCsv(rows.map(r => ({
      name: r.name, email: r.email, role: r.role, job_title: r.jobTitle || "", department: r.department || "",
      giveable_points: r.giveablePoints, redeemable_points: r.redeemablePoints, active: r.isActive,
      created_at: r.createdAt.toISOString(), last_login_at: r.lastLoginAt?.toISOString() || "",
    })));
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="users-${Date.now()}.csv"` },
    });
  }

  return NextResponse.json({ error: "Unknown type. Use ?type=recognitions|redemptions|users" }, { status: 400 });
}
