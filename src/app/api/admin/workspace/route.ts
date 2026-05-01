import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { auditWorkspace } from "@/lib/audit";

const ALLOWED_CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD", "JPY", "MYR", "PHP", "THB", "BDT"];
const ALLOWED_CHAT_TYPES = ["slack", "teams", "discord", "generic", ""];

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  monthlyBudgetPoints: z.number().int().min(0).max(100_000_000).optional(),
  currency: z.enum(ALLOWED_CURRENCIES as [string, ...string[]]).optional(),
  autoBirthdayEnabled: z.boolean().optional(),
  autoBirthdayPoints: z.number().int().min(0).max(100_000).optional(),
  autoBirthdayMessage: z.string().max(500).optional(),
  autoAnniversaryEnabled: z.boolean().optional(),
  autoAnniversaryPoints: z.number().int().min(0).max(100_000).optional(),
  autoAnniversaryMessage: z.string().max(500).optional(),
  emailOnKudos: z.boolean().optional(),
  emailOnRedemption: z.boolean().optional(),
  emailOnNomination: z.boolean().optional(),
  emailOnWelcome: z.boolean().optional(),
  emailWeeklyDigest: z.boolean().optional(),
  chatWebhookType: z.enum(ALLOWED_CHAT_TYPES as [string, ...string[]]).nullable().optional(),
  // URL validated to be https only to prevent SSRF to internal services; empty string treated as null (clear)
  chatWebhookUrl: z.union([
    z.string().url().startsWith("https://").max(500),
    z.literal("").transform(() => null as null),
    z.null(),
  ]).optional(),
  chatChannelLabel: z.string().max(100).nullable().optional(),
  chatOnKudos: z.boolean().optional(),
  chatOnAutoKudos: z.boolean().optional(),
  chatOnNominationAwarded: z.boolean().optional(),
  onboardingDismissed: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });

  const input = parsed.data;
  const data: any = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.monthlyBudgetPoints !== undefined) data.monthlyBudgetPoints = input.monthlyBudgetPoints;
  if (input.currency !== undefined) data.currency = input.currency;
  // Auto-kudos
  if (input.autoBirthdayEnabled !== undefined) data.autoBirthdayEnabled = input.autoBirthdayEnabled;
  if (input.autoBirthdayPoints !== undefined) data.autoBirthdayPoints = input.autoBirthdayPoints;
  if (input.autoBirthdayMessage !== undefined) data.autoBirthdayMessage = input.autoBirthdayMessage;
  if (input.autoAnniversaryEnabled !== undefined) data.autoAnniversaryEnabled = input.autoAnniversaryEnabled;
  if (input.autoAnniversaryPoints !== undefined) data.autoAnniversaryPoints = input.autoAnniversaryPoints;
  if (input.autoAnniversaryMessage !== undefined) data.autoAnniversaryMessage = input.autoAnniversaryMessage;
  // Email toggles
  if (input.emailOnKudos !== undefined) data.emailOnKudos = input.emailOnKudos;
  if (input.emailOnRedemption !== undefined) data.emailOnRedemption = input.emailOnRedemption;
  if (input.emailOnNomination !== undefined) data.emailOnNomination = input.emailOnNomination;
  if (input.emailOnWelcome !== undefined) data.emailOnWelcome = input.emailOnWelcome;
  if (input.emailWeeklyDigest !== undefined) data.emailWeeklyDigest = input.emailWeeklyDigest;
  // Chat integrations
  if (input.chatWebhookType !== undefined) data.chatWebhookType = input.chatWebhookType || null;
  if (input.chatWebhookUrl !== undefined) data.chatWebhookUrl = input.chatWebhookUrl || null;
  if (input.chatChannelLabel !== undefined) data.chatChannelLabel = input.chatChannelLabel || null;
  if (input.chatOnKudos !== undefined) data.chatOnKudos = input.chatOnKudos;
  if (input.chatOnAutoKudos !== undefined) data.chatOnAutoKudos = input.chatOnAutoKudos;
  if (input.chatOnNominationAwarded !== undefined) data.chatOnNominationAwarded = input.chatOnNominationAwarded;
  // Onboarding
  if (input.onboardingDismissed !== undefined) data.onboardingDismissed = input.onboardingDismissed;

  const ws = await prisma.workspace.update({ where: { id: admin.workspaceId }, data });

  // Audit which group of settings was changed
  const keys = Object.keys(data);
  if (keys.some(k => k.startsWith("auto"))) auditWorkspace("auto_kudos_toggled", { workspaceId: admin.workspaceId, actorId: admin.id, metadata: data });
  else if (keys.some(k => k.startsWith("email"))) auditWorkspace("email_settings_updated", { workspaceId: admin.workspaceId, actorId: admin.id, metadata: data });
  else if (keys.some(k => k.startsWith("chat"))) auditWorkspace("chat_webhook_updated", { workspaceId: admin.workspaceId, actorId: admin.id, metadata: { type: data.chatWebhookType, hasUrl: !!data.chatWebhookUrl } });
  else auditWorkspace("settings_updated", { workspaceId: admin.workspaceId, actorId: admin.id, metadata: data });

  return NextResponse.json({ ok: true, workspace: ws });
}
