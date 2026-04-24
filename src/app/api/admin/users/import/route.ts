import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

function parseCsv(csv: string) {
  const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return { header: [], rows: [] };
  const header = splitCsvLine(lines[0]).map(c => c.trim().toLowerCase());
  const rows = lines.slice(1).map(splitCsvLine);
  return { header, rows };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "", inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else cur += ch;
    } else {
      if (ch === '"') inQuote = true;
      else if (ch === ",") { out.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const csv = await req.text();
  const { header, rows } = parseCsv(csv);
  if (!header.includes("email") || !header.includes("name") || !header.includes("password")) {
    return NextResponse.json({ error: "CSV must include name, email, password columns" }, { status: 400 });
  }

  const idx = {
    name: header.indexOf("name"),
    email: header.indexOf("email"),
    password: header.indexOf("password"),
    role: header.indexOf("role"),
    jobTitle: header.indexOf("jobtitle"),
    department: header.indexOf("department"),
  };

  let created = 0, skipped = 0;
  const errors: string[] = [];
  for (const row of rows) {
    const email = (row[idx.email] || "").trim().toLowerCase();
    const name = (row[idx.name] || "").trim();
    const password = (row[idx.password] || "").trim();
    if (!email || !name || password.length < 6) { skipped++; errors.push(`${email || "?"}: missing fields or weak password`); continue; }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { skipped++; errors.push(`${email}: already exists`); continue; }
    const role = (row[idx.role] || "EMPLOYEE").toUpperCase();
    if (!["EMPLOYEE", "MANAGER", "HR_ADMIN"].includes(role)) { skipped++; errors.push(`${email}: invalid role ${role}`); continue; }
    try {
      await prisma.user.create({
        data: {
          workspaceId: admin.workspaceId,
          name, email,
          passwordHash: await bcrypt.hash(password, 10),
          role: role as any,
          jobTitle: idx.jobTitle >= 0 ? row[idx.jobTitle] || null : null,
          department: idx.department >= 0 ? row[idx.department] || null : null,
          giveablePoints: 500,
        },
      });
      created++;
    } catch (e: any) {
      skipped++;
      errors.push(`${email}: ${e.message || "error"}`);
    }
  }

  return NextResponse.json({ created, skipped, errors });
}
