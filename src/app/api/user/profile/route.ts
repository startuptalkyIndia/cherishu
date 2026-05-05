import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  jobTitle: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
});

export async function PATCH(req: Request) {
  const user = await requireUser();

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });

  const data: any = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.jobTitle !== undefined) data.jobTitle = parsed.data.jobTitle || null;
  if (parsed.data.department !== undefined) data.department = parsed.data.department || null;

  if (Object.keys(data).length === 0) return NextResponse.json({ ok: true });

  await prisma.user.update({ where: { id: user.id }, data });

  return NextResponse.json({ ok: true });
}
