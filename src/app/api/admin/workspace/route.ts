import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function PATCH(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.monthlyBudgetPoints === "number") data.monthlyBudgetPoints = body.monthlyBudgetPoints;
  if (typeof body.currency === "string") data.currency = body.currency;
  // Auto-kudos
  if (typeof body.autoBirthdayEnabled === "boolean") data.autoBirthdayEnabled = body.autoBirthdayEnabled;
  if (typeof body.autoBirthdayPoints === "number") data.autoBirthdayPoints = body.autoBirthdayPoints;
  if (typeof body.autoBirthdayMessage === "string") data.autoBirthdayMessage = body.autoBirthdayMessage;
  if (typeof body.autoAnniversaryEnabled === "boolean") data.autoAnniversaryEnabled = body.autoAnniversaryEnabled;
  if (typeof body.autoAnniversaryPoints === "number") data.autoAnniversaryPoints = body.autoAnniversaryPoints;
  if (typeof body.autoAnniversaryMessage === "string") data.autoAnniversaryMessage = body.autoAnniversaryMessage;
  // Email toggles
  if (typeof body.emailOnKudos === "boolean") data.emailOnKudos = body.emailOnKudos;
  if (typeof body.emailOnRedemption === "boolean") data.emailOnRedemption = body.emailOnRedemption;
  if (typeof body.emailOnNomination === "boolean") data.emailOnNomination = body.emailOnNomination;
  if (typeof body.emailOnWelcome === "boolean") data.emailOnWelcome = body.emailOnWelcome;
  if (typeof body.emailWeeklyDigest === "boolean") data.emailWeeklyDigest = body.emailWeeklyDigest;
  // Chat integrations
  if (typeof body.chatWebhookType === "string") data.chatWebhookType = body.chatWebhookType || null;
  if (typeof body.chatWebhookUrl === "string") data.chatWebhookUrl = body.chatWebhookUrl || null;
  if (typeof body.chatChannelLabel === "string") data.chatChannelLabel = body.chatChannelLabel || null;
  if (typeof body.chatOnKudos === "boolean") data.chatOnKudos = body.chatOnKudos;
  if (typeof body.chatOnAutoKudos === "boolean") data.chatOnAutoKudos = body.chatOnAutoKudos;
  if (typeof body.chatOnNominationAwarded === "boolean") data.chatOnNominationAwarded = body.chatOnNominationAwarded;
  // Onboarding
  if (typeof body.onboardingDismissed === "boolean") data.onboardingDismissed = body.onboardingDismissed;

  const ws = await prisma.workspace.update({ where: { id: admin.workspaceId }, data });
  return NextResponse.json({ ok: true, workspace: ws });
}
