/**
 * Reward Provider Abstraction
 * Any new provider (Xoxoday, Tremendous, Amazon Incentives, Giftbit, custom,
 * Marketplace) implements this interface. Redemption flow calls provider.fulfill()
 * which either (a) generates a voucher code, (b) hits the provider's API,
 * (c) emails the merchant (Marketplace), or (d) queues for manual fulfillment.
 */

import type { RewardProvider } from "@prisma/client";
import { prisma } from "./prisma";
import { sendEmail } from "./email";

export interface FulfillmentRequest {
  rewardId: string;
  redemptionId: string;
  userId: string;
  userEmail: string;
  userName: string;
  pointsSpent: number;
  providerSku?: string | null;
  currencyValue?: number | null;
  currency: string;
  shippingAddress?: Record<string, unknown> | null;
  merchantId?: string | null;
}

export interface FulfillmentResult {
  success: boolean;
  status: "FULFILLED" | "PENDING" | "FAILED";
  voucherCode?: string;
  redemptionUrl?: string;
  trackingNumber?: string;
  providerRef?: string;
  notes?: string;
  error?: string;
}

export interface RewardProviderAdapter {
  name: RewardProvider;
  fulfill(req: FulfillmentRequest, config?: ProviderConfig): Promise<FulfillmentResult>;
}

export interface ProviderConfig {
  apiKey?: string | null;
  apiSecret?: string | null;
  accountId?: string | null;
  config?: Record<string, unknown> | null;
}

// ─── Manual Provider ──────────────────────────────────────────────────────
const manualProvider: RewardProviderAdapter = {
  name: "MANUAL",
  async fulfill() {
    return {
      success: true,
      status: "PENDING",
      notes: "Awaiting HR admin manual fulfillment.",
    };
  },
};

// ─── Marketplace Provider ─────────────────────────────────────────────────
// Redemption → notify merchant with full order details. Merchant fulfills
// directly with the employee; Cherishu records commission.
const marketplaceProvider: RewardProviderAdapter = {
  name: "MARKETPLACE",
  async fulfill(req) {
    if (!req.merchantId) {
      return { success: false, status: "FAILED", error: "No merchant linked to this reward" };
    }
    const merchant = await prisma.merchant.findUnique({ where: { id: req.merchantId } });
    if (!merchant || !merchant.isActive) {
      return { success: false, status: "FAILED", error: "Merchant inactive or not found" };
    }

    // Email the merchant with the order handoff
    const reward = await prisma.reward.findUnique({ where: { id: req.rewardId } });
    const addr = (req.shippingAddress || {}) as Record<string, string>;
    const addrStr = [addr.name, addr.street, addr.city, addr.state, addr.postal, addr.country, addr.phone].filter(Boolean).join(", ") || "Not provided";

    const orderRef = `CHR-${req.redemptionId.slice(-8).toUpperCase()}`;
    const commission = merchant.commissionPercent && req.currencyValue ? +(req.currencyValue * merchant.commissionPercent / 100).toFixed(2) : 0;

    if (merchant.handoffMethod === "email") {
      const body = `
        <h2>New Cherishu marketplace order · ${orderRef}</h2>
        <p><strong>Product:</strong> ${reward?.name || "(unknown)"}</p>
        <p><strong>SKU:</strong> ${reward?.providerSku || "(none)"}</p>
        <p><strong>Order value:</strong> ${req.currency} ${req.currencyValue ?? "(not set)"}</p>
        <p><strong>Recipient:</strong> ${req.userName} &lt;${req.userEmail}&gt;</p>
        <p><strong>Shipping to:</strong> ${addrStr}</p>
        <hr/>
        <p style="color:#6b7280;font-size:13px;">Cherishu commission: ${req.currency} ${commission} (${merchant.commissionPercent}%). Settled on the next billing cycle.</p>
        <p style="color:#6b7280;font-size:13px;">Please fulfill this order at your earliest and reply to this email with tracking details when shipped. Order reference: <strong>${orderRef}</strong>.</p>
      `;
      await sendEmail({
        to: merchant.contactEmail,
        subject: `Cherishu order ${orderRef} · ${reward?.name || "Item"}`,
        html: body,
      });
    }

    if (merchant.handoffMethod === "webhook" && merchant.webhookUrl) {
      try {
        await fetch(merchant.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_ref: orderRef,
            product: { name: reward?.name, sku: reward?.providerSku, value: req.currencyValue, currency: req.currency },
            recipient: { name: req.userName, email: req.userEmail },
            shipping: addr,
            commission_percent: merchant.commissionPercent,
            commission_value: commission,
          }),
        });
      } catch (e) {
        console.error(`[marketplace webhook ${merchant.slug}] ${(e as Error).message}`);
      }
    }

    return {
      success: true,
      status: "PENDING",
      providerRef: orderRef,
      notes: `Handed off to ${merchant.name} via ${merchant.handoffMethod}. Awaiting fulfillment.`,
    };
  },
};

// ─── Xoxoday Provider (stub) ──────────────────────────────────────────────
const xoxodayProvider: RewardProviderAdapter = {
  name: "XOXODAY",
  async fulfill(req, config) {
    if (!config?.apiKey) {
      return { success: false, status: "FAILED", error: "Xoxoday API key not configured" };
    }
    const code = `XOXO-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    return {
      success: true,
      status: "FULFILLED",
      voucherCode: code,
      redemptionUrl: `https://www.xoxoday.com/redeem/${code}`,
      providerRef: `xoxo_${Date.now()}`,
      notes: "Fulfilled via Xoxoday (stub — connect real API in production)",
    };
  },
};

const tremendousProvider: RewardProviderAdapter = {
  name: "TREMENDOUS",
  async fulfill(req, config) {
    if (!config?.apiKey) return { success: false, status: "FAILED", error: "Tremendous API key not configured" };
    const ref = `trem_${Date.now()}`;
    return { success: true, status: "FULFILLED", providerRef: ref, redemptionUrl: `https://reward.tremendous.com/r/${ref}`, notes: "Fulfilled via Tremendous (stub)" };
  },
};

const amazonProvider: RewardProviderAdapter = {
  name: "AMAZON_INCENTIVES",
  async fulfill(req, config) {
    if (!config?.apiKey) return { success: false, status: "FAILED", error: "Amazon AGCOD credentials not configured" };
    const code = `AMZN-${Math.random().toString(36).slice(2, 14).toUpperCase()}`;
    return { success: true, status: "FULFILLED", voucherCode: code, redemptionUrl: "https://amazon.in/gc/redeem", providerRef: `amzn_${Date.now()}`, notes: "Fulfilled via Amazon Incentives (stub)" };
  },
};

const giftbitProvider: RewardProviderAdapter = {
  name: "GIFTBIT",
  async fulfill(req, config) {
    if (!config?.apiKey) return { success: false, status: "FAILED", error: "Giftbit API key not configured" };
    const code = `GBIT-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
    return { success: true, status: "FULFILLED", voucherCode: code, providerRef: `gbit_${Date.now()}`, notes: "Fulfilled via Giftbit (stub)" };
  },
};

const customApiProvider: RewardProviderAdapter = {
  name: "CUSTOM_API",
  async fulfill(req, config) {
    const url = (config?.config as any)?.webhookUrl;
    if (!url) return { success: false, status: "FAILED", error: "Custom webhook URL not set" };
    return { success: true, status: "PENDING", notes: `Queued to custom webhook: ${url}` };
  },
};

const registry: Record<RewardProvider, RewardProviderAdapter> = {
  MANUAL: manualProvider,
  MARKETPLACE: marketplaceProvider,
  XOXODAY: xoxodayProvider,
  TREMENDOUS: tremendousProvider,
  AMAZON_INCENTIVES: amazonProvider,
  GIFTBIT: giftbitProvider,
  CUSTOM_API: customApiProvider,
};

export function getProvider(name: RewardProvider): RewardProviderAdapter {
  return registry[name] || manualProvider;
}

export const REWARD_TYPE_META: Record<string, { label: string; emoji: string; desc: string }> = {
  GIFT_CARD:    { label: "Gift Card",    emoji: "🎁", desc: "Digital gift cards for popular brands" },
  EXPERIENCE:   { label: "Experience",   emoji: "✨", desc: "Spa, dinners, concerts, staycations" },
  MERCHANDISE:  { label: "Merchandise",  emoji: "📦", desc: "Physical products delivered home" },
  CASHBACK:     { label: "Cashback",     emoji: "💰", desc: "Direct credit to bank or wallet" },
  CHARITY:      { label: "Charity",      emoji: "🤝", desc: "Donate on the recipient's behalf" },
  CUSTOM_SWAG:  { label: "Company Swag", emoji: "👕", desc: "Branded merchandise from your company" },
  VOUCHER:      { label: "Voucher",      emoji: "🎟️", desc: "Generic vouchers and coupons" },
  SUBSCRIPTION: { label: "Subscription", emoji: "📺", desc: "Netflix, Spotify, and more" },
  TRAVEL:       { label: "Travel",       emoji: "✈️", desc: "Flights, hotels, getaways" },
};
