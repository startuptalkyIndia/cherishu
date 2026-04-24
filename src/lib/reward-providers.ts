/**
 * Reward Provider Abstraction
 * Any new provider (Xoxoday, Tremendous, Amazon Incentives, Giftbit, custom)
 * implements this interface. Redemption flow calls provider.fulfill() which
 * either (a) generates a voucher code, (b) hits the provider's API, or (c) queues
 * for manual fulfillment by HR admin.
 */

import type { RewardProvider } from "@prisma/client";

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

// ─── Xoxoday Provider (stub — wire real API when keys provided) ───────────
const xoxodayProvider: RewardProviderAdapter = {
  name: "XOXODAY",
  async fulfill(req, config) {
    if (!config?.apiKey) {
      return { success: false, status: "FAILED", error: "Xoxoday API key not configured" };
    }
    // Real call: POST https://stagingplumproapi.xoxoday.com/api/v1/oauth/api/
    // with { query: "placeOrder", tag: "placeOrder", data: {...} }
    // Here we stub a generated voucher code.
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

// ─── Tremendous Provider (stub) ───────────────────────────────────────────
const tremendousProvider: RewardProviderAdapter = {
  name: "TREMENDOUS",
  async fulfill(req, config) {
    if (!config?.apiKey) {
      return { success: false, status: "FAILED", error: "Tremendous API key not configured" };
    }
    // Real call: POST https://testflight.tremendous.com/api/v2/orders
    const ref = `trem_${Date.now()}`;
    return {
      success: true,
      status: "FULFILLED",
      providerRef: ref,
      redemptionUrl: `https://reward.tremendous.com/r/${ref}`,
      notes: "Fulfilled via Tremendous (stub)",
    };
  },
};

// ─── Amazon Incentives Provider (stub) ────────────────────────────────────
const amazonProvider: RewardProviderAdapter = {
  name: "AMAZON_INCENTIVES",
  async fulfill(req, config) {
    if (!config?.apiKey) {
      return { success: false, status: "FAILED", error: "Amazon AGCOD credentials not configured" };
    }
    const code = `AMZN-${Math.random().toString(36).slice(2, 14).toUpperCase()}`;
    return {
      success: true,
      status: "FULFILLED",
      voucherCode: code,
      redemptionUrl: "https://amazon.in/gc/redeem",
      providerRef: `amzn_${Date.now()}`,
      notes: "Fulfilled via Amazon Incentives (stub)",
    };
  },
};

// ─── Giftbit Provider (stub) ──────────────────────────────────────────────
const giftbitProvider: RewardProviderAdapter = {
  name: "GIFTBIT",
  async fulfill(req, config) {
    if (!config?.apiKey) {
      return { success: false, status: "FAILED", error: "Giftbit API key not configured" };
    }
    const code = `GBIT-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
    return {
      success: true,
      status: "FULFILLED",
      voucherCode: code,
      providerRef: `gbit_${Date.now()}`,
      notes: "Fulfilled via Giftbit (stub)",
    };
  },
};

// ─── Custom API Provider (webhook-based) ──────────────────────────────────
const customApiProvider: RewardProviderAdapter = {
  name: "CUSTOM_API",
  async fulfill(req, config) {
    const url = (config?.config as any)?.webhookUrl;
    if (!url) return { success: false, status: "FAILED", error: "Custom webhook URL not set" };
    return {
      success: true,
      status: "PENDING",
      notes: `Queued to custom webhook: ${url}`,
    };
  },
};

const registry: Record<RewardProvider, RewardProviderAdapter> = {
  MANUAL: manualProvider,
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
