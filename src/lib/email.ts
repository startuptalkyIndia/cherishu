import { prisma } from "./prisma";

/**
 * Email sender. Uses Resend via HTTPS (no SDK dependency).
 * Falls back to console.log if RESEND_API_KEY is not configured.
 *
 * Platform admin sets:
 *   - resend_api_key (required)
 *   - email_from       e.g. "Cherishu <hello@cherishu.talkytools.com>"
 *   - email_base_url   for links (default: NEXTAUTH_URL env)
 */

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

async function getPlatformConfig() {
  const settings = await prisma.platformSetting.findMany({
    where: { key: { in: ["resend_api_key", "email_from", "email_base_url"] } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return {
    apiKey: map.resend_api_key || process.env.RESEND_API_KEY || "",
    from: map.email_from || process.env.EMAIL_FROM || "Cherishu <onboarding@resend.dev>",
    baseUrl: map.email_base_url || process.env.NEXTAUTH_URL || "https://cherishu.talkytools.com",
  };
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; id?: string; error?: string; skipped?: boolean }> {
  const cfg = await getPlatformConfig();
  if (!cfg.apiKey) {
    console.log(`[email-skip] no API key · to=${payload.to} · subject="${payload.subject}"`);
    return { ok: true, skipped: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        from: cfg.from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`[email-fail] ${res.status}: ${err}`);
      return { ok: false, error: err };
    }
    const data = await res.json();
    return { ok: true, id: data.id };
  } catch (e: any) {
    console.error(`[email-err] ${e.message}`);
    return { ok: false, error: e.message };
  }
}

/* ───────────────────────── Template helpers ─────────────────────────── */

function baseLayout(body: string, baseUrl: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Cherishu</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <tr><td style="padding:20px 28px;border-bottom:1px solid #f3f4f6;">
          <a href="${baseUrl}" style="text-decoration:none;color:#111827;display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:28px;height:28px;background:#4f46e5;border-radius:6px;color:#fff;text-align:center;line-height:28px;font-weight:700;">♥</span>
            <span style="font-weight:700;font-size:16px;color:#111827;">Cherishu</span>
          </a>
        </td></tr>
        <tr><td style="padding:28px;">${body}</td></tr>
        <tr><td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #f3f4f6;color:#6b7280;font-size:12px;text-align:center;">
          You're receiving this because you're on a Cherishu workspace.<br/>
          <a href="${baseUrl}" style="color:#4f46e5;text-decoration:none;">cherishu.talkytools.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:14px;">${label}</a>`;
}

/* ───────────────────────── Concrete emails ──────────────────────────── */

export async function emailWelcome({ email, name, workspaceName, tempPassword }: { email: string; name: string; workspaceName: string; tempPassword?: string }) {
  const cfg = await getPlatformConfig();
  const body = `
    <h1 style="font-size:22px;margin:0 0 8px;color:#111827;">Welcome to ${escapeHtml(workspaceName)} 👋</h1>
    <p style="color:#374151;line-height:1.6;margin:0 0 16px;">Hi ${escapeHtml(name.split(" ")[0])}, you've been added to your company's recognition platform. Start cherishing your teammates today.</p>
    ${tempPassword ? `<p style="color:#374151;margin:0 0 8px;"><strong>Your temporary password:</strong> <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:14px;">${escapeHtml(tempPassword)}</code></p><p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Change it after your first sign-in.</p>` : ""}
    ${button("Sign in to Cherishu", cfg.baseUrl + "/login")}
  `;
  return sendEmail({ to: email, subject: `Welcome to ${workspaceName} on Cherishu`, html: baseLayout(body, cfg.baseUrl) });
}

export async function emailKudosReceived({ to, receiverName, senderName, message, points, workspaceName }: { to: string; receiverName: string; senderName: string; message: string; points: number; workspaceName: string }) {
  const cfg = await getPlatformConfig();
  const body = `
    <h1 style="font-size:22px;margin:0 0 8px;color:#111827;">🎉 You received a kudos!</h1>
    <p style="color:#374151;line-height:1.6;margin:0 0 16px;">${escapeHtml(senderName)} just recognized you on <strong>${escapeHtml(workspaceName)}</strong>${points > 0 ? ` and awarded you <strong style="color:#4f46e5;">+${points} points</strong>` : ""}.</p>
    <div style="background:#eef2ff;border-left:4px solid #4f46e5;padding:16px;border-radius:4px;margin:16px 0;color:#312e81;font-style:italic;">"${escapeHtml(message)}"</div>
    ${button("View on Cherishu", cfg.baseUrl + "/dashboard")}
  `;
  return sendEmail({ to, subject: `${senderName} recognized you on Cherishu${points > 0 ? ` (+${points} pts)` : ""}`, html: baseLayout(body, cfg.baseUrl) });
}

export async function emailRedemptionFulfilled({ to, name, rewardName, voucherCode, redemptionUrl }: { to: string; name: string; rewardName: string; voucherCode?: string | null; redemptionUrl?: string | null }) {
  const cfg = await getPlatformConfig();
  const body = `
    <h1 style="font-size:22px;margin:0 0 8px;color:#111827;">Your reward is ready 🎁</h1>
    <p style="color:#374151;line-height:1.6;margin:0 0 16px;">Hi ${escapeHtml(name.split(" ")[0])}, your redemption of <strong>${escapeHtml(rewardName)}</strong> has been fulfilled.</p>
    ${voucherCode ? `<div style="background:#f9fafb;padding:16px;border-radius:8px;border:1px dashed #d1d5db;text-align:center;margin:16px 0;">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Voucher code</div>
      <div style="font-size:18px;font-weight:700;letter-spacing:1px;color:#111827;font-family:monospace;">${escapeHtml(voucherCode)}</div>
    </div>` : ""}
    ${redemptionUrl ? button("Redeem now", redemptionUrl) : button("View in Cherishu", cfg.baseUrl + "/dashboard/redemptions")}
  `;
  return sendEmail({ to, subject: `Your ${rewardName} is ready on Cherishu`, html: baseLayout(body, cfg.baseUrl) });
}

export async function emailNominationPending({ to, nominatorName, nomineeName, award }: { to: string | string[]; nominatorName: string; nomineeName: string; award: string }) {
  const cfg = await getPlatformConfig();
  const body = `
    <h1 style="font-size:22px;margin:0 0 8px;color:#111827;">New nomination awaiting review</h1>
    <p style="color:#374151;line-height:1.6;margin:0 0 16px;"><strong>${escapeHtml(nominatorName)}</strong> nominated <strong>${escapeHtml(nomineeName)}</strong> for the <strong>${escapeHtml(award)}</strong> award.</p>
    ${button("Review nominations", cfg.baseUrl + "/admin/nominations")}
  `;
  return sendEmail({ to: Array.isArray(to) ? to : [to], subject: `New nomination for ${nomineeName} on Cherishu`, html: baseLayout(body, cfg.baseUrl) });
}

export async function emailWeeklyDigest({ to, workspaceName, period, totalKudos, totalPoints, topReceivers, topValue }: {
  to: string | string[];
  workspaceName: string;
  period: string; // "Apr 17 – Apr 24"
  totalKudos: number;
  totalPoints: number;
  topReceivers: { name: string; points: number }[];
  topValue?: string;
}) {
  const cfg = await getPlatformConfig();
  const receiverRows = topReceivers.slice(0, 5).map((r, i) => `
    <tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>${i + 1}.</strong> ${escapeHtml(r.name)}</td>
    <td style="padding:6px 0;color:#4f46e5;font-weight:600;text-align:right;">${r.points} pts</td></tr>`).join("");
  const body = `
    <h1 style="font-size:22px;margin:0 0 8px;color:#111827;">Weekly recap · ${escapeHtml(workspaceName)}</h1>
    <p style="color:#6b7280;margin:0 0 20px;">${escapeHtml(period)}</p>
    <div style="display:flex;gap:12px;margin-bottom:20px;">
      <div style="flex:1;background:#eef2ff;padding:14px;border-radius:8px;"><div style="font-size:24px;font-weight:700;color:#4f46e5;">${totalKudos}</div><div style="font-size:12px;color:#6b7280;">kudos sent</div></div>
      <div style="flex:1;background:#ecfdf5;padding:14px;border-radius:8px;"><div style="font-size:24px;font-weight:700;color:#059669;">${totalPoints}</div><div style="font-size:12px;color:#6b7280;">points awarded</div></div>
    </div>
    ${topReceivers.length > 0 ? `<h3 style="margin:24px 0 8px;color:#111827;font-size:16px;">Top recognized teammates</h3>
    <table width="100%" cellpadding="0" cellspacing="0">${receiverRows}</table>` : ""}
    ${topValue ? `<p style="color:#374151;margin:20px 0 0;"><strong>Most-lived value this week:</strong> ${escapeHtml(topValue)}</p>` : ""}
    <div style="margin-top:24px;">${button("Open Cherishu", cfg.baseUrl + "/admin")}</div>
  `;
  return sendEmail({ to, subject: `Cherishu weekly recap · ${workspaceName}`, html: baseLayout(body, cfg.baseUrl) });
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
