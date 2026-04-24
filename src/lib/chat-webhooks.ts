/**
 * Chat integrations — posts kudos/auto-kudos/nominations to Slack, Teams,
 * Discord, or a generic webhook. Each workspace configures one webhook URL
 * + type in its HR admin settings. Failures never throw (swallowed + logged)
 * so a broken webhook never blocks core kudos flow.
 */

export type WebhookType = "slack" | "teams" | "discord" | "generic";

interface KudosPayload {
  kind: "kudos" | "birthday" | "anniversary" | "nomination";
  workspaceName: string;
  senderName?: string; // null for system/auto kudos
  receiverName: string;
  message: string;
  points?: number;
  badge?: string | null;
  value?: string | null;
  award?: string | null; // for nominations
  baseUrl: string;
}

export async function postToChat(type: WebhookType, url: string, payload: KudosPayload) {
  try {
    const body = format(type, payload);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error(`[chat-${type}] ${res.status}: ${err.slice(0, 200)}`);
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e: any) {
    console.error(`[chat-${type}] ${e.message}`);
    return { ok: false, error: e.message };
  }
}

/* ─────────────────── Formatters per platform ─────────────────── */

function format(type: WebhookType, p: KudosPayload): any {
  if (type === "slack") return formatSlack(p);
  if (type === "teams") return formatTeams(p);
  if (type === "discord") return formatDiscord(p);
  return formatGeneric(p);
}

function titleFor(p: KudosPayload): string {
  if (p.kind === "birthday") return `🎂 Happy birthday, ${p.receiverName}!`;
  if (p.kind === "anniversary") return `🎉 Work anniversary for ${p.receiverName}!`;
  if (p.kind === "nomination") return `🏆 ${p.receiverName} has been awarded: ${p.award}`;
  return `✨ ${p.senderName} recognized ${p.receiverName}${p.points ? ` (+${p.points} pts)` : ""}`;
}

function formatSlack(p: KudosPayload) {
  const title = titleFor(p);
  const fields: { type: string; text: string }[] = [];
  if (p.points !== undefined && p.points > 0) fields.push({ type: "mrkdwn", text: `*Points*\n${p.points}` });
  if (p.badge) fields.push({ type: "mrkdwn", text: `*Badge*\n${p.badge}` });
  if (p.value) fields.push({ type: "mrkdwn", text: `*Value*\n${p.value}` });
  if (p.award) fields.push({ type: "mrkdwn", text: `*Award*\n${p.award}` });

  return {
    text: title, // fallback for notifications
    blocks: [
      { type: "header", text: { type: "plain_text", text: title, emoji: true } },
      { type: "section", text: { type: "mrkdwn", text: `> ${p.message}` } },
      ...(fields.length > 0 ? [{ type: "section", fields }] : []),
      { type: "context", elements: [{ type: "mrkdwn", text: `From *${p.workspaceName}* on <${p.baseUrl}|Cherishu>` }] },
    ],
  };
}

function formatTeams(p: KudosPayload) {
  const title = titleFor(p);
  const facts: { name: string; value: string }[] = [];
  if (p.senderName) facts.push({ name: "From", value: p.senderName });
  facts.push({ name: "To", value: p.receiverName });
  if (p.points !== undefined && p.points > 0) facts.push({ name: "Points", value: `+${p.points}` });
  if (p.badge) facts.push({ name: "Badge", value: p.badge });
  if (p.value) facts.push({ name: "Value", value: p.value });
  if (p.award) facts.push({ name: "Award", value: p.award });

  return {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: title,
    themeColor: "4F46E5",
    title,
    text: p.message,
    sections: [{ facts }],
    potentialAction: [
      {
        "@type": "OpenUri",
        name: "Open Cherishu",
        targets: [{ os: "default", uri: p.baseUrl }],
      },
    ],
  };
}

function formatDiscord(p: KudosPayload) {
  const title = titleFor(p);
  const fields: { name: string; value: string; inline: boolean }[] = [];
  if (p.senderName) fields.push({ name: "From", value: p.senderName, inline: true });
  fields.push({ name: "To", value: p.receiverName, inline: true });
  if (p.points !== undefined && p.points > 0) fields.push({ name: "Points", value: `+${p.points}`, inline: true });
  if (p.badge) fields.push({ name: "Badge", value: p.badge, inline: true });
  if (p.value) fields.push({ name: "Value", value: p.value, inline: true });
  if (p.award) fields.push({ name: "Award", value: p.award, inline: true });

  return {
    embeds: [{
      title,
      description: p.message,
      color: 5195503, // #4f46e5 in decimal
      fields,
      footer: { text: `${p.workspaceName} · Cherishu` },
      url: p.baseUrl,
      timestamp: new Date().toISOString(),
    }],
  };
}

function formatGeneric(p: KudosPayload) {
  // Clean JSON payload for any custom endpoint
  return {
    event: p.kind,
    workspace: p.workspaceName,
    sender: p.senderName || null,
    receiver: p.receiverName,
    message: p.message,
    points: p.points || 0,
    badge: p.badge || null,
    value: p.value || null,
    award: p.award || null,
    url: p.baseUrl,
    timestamp: new Date().toISOString(),
  };
}

/* ────────────────────────── Helper ────────────────────────── */

export async function getChatConfig(workspace: {
  chatWebhookType: string | null;
  chatWebhookUrl: string | null;
  chatOnKudos: boolean;
  chatOnAutoKudos: boolean;
  chatOnNominationAwarded: boolean;
}, eventType: "kudos" | "autoKudos" | "nominationAwarded") {
  if (!workspace.chatWebhookUrl || !workspace.chatWebhookType) return null;
  const flags = {
    kudos: workspace.chatOnKudos,
    autoKudos: workspace.chatOnAutoKudos,
    nominationAwarded: workspace.chatOnNominationAwarded,
  };
  if (!flags[eventType]) return null;
  return { type: workspace.chatWebhookType as WebhookType, url: workspace.chatWebhookUrl };
}
