import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";

const VALID_TYPES = ["GIFT_CARD", "EXPERIENCE", "MERCHANDISE", "CASHBACK", "CHARITY", "CUSTOM_SWAG", "VOUCHER", "SUBSCRIPTION", "TRAVEL"];

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

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await ctx.params;

  const merchant = await prisma.merchant.findUnique({ where: { id } });
  if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

  const csv = await req.text();
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return NextResponse.json({ error: "CSV must have header + at least one row" }, { status: 400 });

  const header = splitCsvLine(lines[0]).map((c) => c.trim().toLowerCase());
  const required = ["name", "sku", "pointscost"];
  for (const req of required) {
    if (!header.includes(req)) return NextResponse.json({ error: `Missing column: ${req}` }, { status: 400 });
  }

  const idx = {
    name: header.indexOf("name"),
    sku: header.indexOf("sku"),
    description: header.indexOf("description"),
    pointsCost: header.indexOf("pointscost"),
    currencyValue: header.indexOf("currencyvalue"),
    currency: header.indexOf("currency"),
    type: header.indexOf("type"),
    imageUrl: header.indexOf("imageurl"),
    category: header.indexOf("category"),
    featured: header.indexOf("featured"),
  };

  let created = 0, skipped = 0;
  const errors: string[] = [];
  for (const line of lines.slice(1)) {
    const row = splitCsvLine(line);
    const name = (row[idx.name] || "").trim();
    const sku = (row[idx.sku] || "").trim();
    const pts = parseInt(row[idx.pointsCost] || "0");
    if (!name || !sku || pts <= 0) { skipped++; errors.push(`"${name || "?"}": missing name/sku/pointsCost`); continue; }
    const rawType = idx.type >= 0 ? (row[idx.type] || "").toUpperCase() : "MERCHANDISE";
    const type = VALID_TYPES.includes(rawType) ? rawType : "MERCHANDISE";
    try {
      await prisma.reward.create({
        data: {
          workspaceId: null,
          merchantId: merchant.id,
          name,
          providerSku: sku,
          description: idx.description >= 0 ? row[idx.description] || null : null,
          pointsCost: pts,
          currencyValue: idx.currencyValue >= 0 ? parseFloat(row[idx.currencyValue] || "0") || null : null,
          currency: idx.currency >= 0 ? (row[idx.currency] || "INR").toUpperCase() : "INR",
          type: type as any,
          provider: "MARKETPLACE",
          imageUrl: idx.imageUrl >= 0 ? row[idx.imageUrl] || null : null,
          category: idx.category >= 0 ? row[idx.category] || null : null,
          featured: idx.featured >= 0 ? /^(true|yes|1)$/i.test(row[idx.featured] || "") : false,
        },
      });
      created++;
    } catch (e: any) {
      skipped++;
      errors.push(`"${name}": ${e.message}`);
    }
  }

  return NextResponse.json({ created, skipped, errors });
}
