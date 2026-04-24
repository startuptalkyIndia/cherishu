import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { emailWelcome } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["EMPLOYEE", "MANAGER", "HR_ADMIN"]),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  giveablePoints: z.number().int().min(0).default(500),
  birthday: z.string().optional(), // YYYY-MM-DD
  joinedAt: z.string().optional(),
});

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });
  const input = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      jobTitle: input.jobTitle || null,
      department: input.department || null,
      giveablePoints: input.giveablePoints,
      workspaceId: admin.workspaceId,
      birthday: input.birthday ? new Date(input.birthday) : null,
      joinedAt: input.joinedAt ? new Date(input.joinedAt) : new Date(),
    },
  });

  // Send welcome email if enabled
  const workspace = await prisma.workspace.findUnique({ where: { id: admin.workspaceId } });
  if (workspace?.emailOnWelcome) {
    emailWelcome({ email: user.email, name: user.name, workspaceName: workspace.name, tempPassword: input.password }).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role, jobTitle: user.jobTitle, department: user.department,
      giveablePoints: user.giveablePoints, redeemablePoints: user.redeemablePoints, isActive: user.isActive,
      birthday: user.birthday?.toISOString().slice(0, 10) || null,
      joinedAt: user.joinedAt.toISOString().slice(0, 10),
      createdAt: user.createdAt.toISOString(),
    },
  });
}
