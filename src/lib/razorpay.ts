/**
 * Razorpay adapter for subscription billing.
 * Uses HTTPS fetch (no SDK dep). Falls back to stub mode if keys aren't set,
 * so the entire billing UI works during development / before Razorpay setup.
 *
 * Platform admin sets:
 *   - razorpay_key_id
 *   - razorpay_key_secret
 *   - razorpay_webhook_secret
 *   - razorpay_plan_pro   (Razorpay plan id for Pro, e.g. plan_xxx)
 */

import crypto from "crypto";
import { prisma } from "./prisma";

const RZP_BASE = "https://api.razorpay.com/v1";

interface Config {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  planIdPro: string;
}

export async function getRazorpayConfig(): Promise<Config> {
  const settings = await prisma.platformSetting.findMany({
    where: { key: { in: ["razorpay_key_id", "razorpay_key_secret", "razorpay_webhook_secret", "razorpay_plan_pro"] } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return {
    keyId: map.razorpay_key_id || process.env.RAZORPAY_KEY_ID || "",
    keySecret: map.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: map.razorpay_webhook_secret || process.env.RAZORPAY_WEBHOOK_SECRET || "",
    planIdPro: map.razorpay_plan_pro || process.env.RAZORPAY_PLAN_PRO || "",
  };
}

export function isRazorpayConfigured(cfg: Config) {
  return !!(cfg.keyId && cfg.keySecret);
}

async function rzpFetch(cfg: Config, path: string, init?: RequestInit) {
  const auth = Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString("base64");
  const res = await fetch(`${RZP_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.description || `Razorpay ${res.status}`);
  return data;
}

// ─── Customers ─────────────────────────────────────────────────────────────
export async function createCustomer(cfg: Config, input: { name: string; email: string; contact?: string }) {
  return rzpFetch(cfg, "/customers", {
    method: "POST",
    body: JSON.stringify({ name: input.name, email: input.email, contact: input.contact || undefined }),
  });
}

// ─── Subscriptions ─────────────────────────────────────────────────────────
export async function createSubscription(cfg: Config, input: { planId: string; quantity: number; customerNotify?: boolean; notes?: Record<string, string> }) {
  return rzpFetch(cfg, "/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: input.planId,
      total_count: 12, // 12 billing cycles
      quantity: input.quantity,
      customer_notify: input.customerNotify ? 1 : 0,
      notes: input.notes,
    }),
  });
}

export async function cancelSubscription(cfg: Config, subscriptionId: string, atPeriodEnd = true) {
  return rzpFetch(cfg, `/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ cancel_at_cycle_end: atPeriodEnd ? 1 : 0 }),
  });
}

// ─── Webhook signature verification ────────────────────────────────────────
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// ─── Stub mode — used when Razorpay isn't configured ───────────────────────
// Returns a fake subscription so the UI flow is testable without real keys.
export function stubCheckoutUrl(workspaceId: string, plan: string) {
  return `/admin/billing/stub-checkout?workspace=${workspaceId}&plan=${plan}`;
}
