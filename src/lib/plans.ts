/**
 * Plan catalog. Source of truth for prices, limits, and features.
 */

export type PlanKey = "free" | "pro" | "enterprise";

export interface Plan {
  key: PlanKey;
  name: string;
  tagline: string;
  pricePerSeatMonthly: number; // INR
  currency: string;
  seatLimit: number | null; // null = unlimited
  featured?: boolean;
  features: string[];
  notIncluded?: string[];
  cta: string;
}

export const PLANS: Record<PlanKey, Plan> = {
  free: {
    key: "free",
    name: "Free",
    tagline: "Try Cherishu with a small team",
    pricePerSeatMonthly: 0,
    currency: "INR",
    seatLimit: 10,
    features: [
      "Up to 10 teammates",
      "Peer recognition with points",
      "Basic leaderboard",
      "Manual rewards catalog",
      "5 default badges + 4 values",
    ],
    notIncluded: [
      "Email notifications",
      "Slack / Teams integration",
      "Auto-kudos (birthdays + anniversaries)",
      "Analytics + CSV exports",
    ],
    cta: "Get started",
  },
  pro: {
    key: "pro",
    name: "Pro",
    tagline: "For growing teams that love their people",
    pricePerSeatMonthly: 199,
    currency: "INR",
    seatLimit: null, // billed per seat, no hard cap
    featured: true,
    features: [
      "Unlimited teammates",
      "Full rewards catalog (9 types, 6 providers)",
      "Slack + Teams + Discord integration",
      "Email notifications + weekly digest",
      "Birthday + work anniversary auto-kudos",
      "Nominations + HR approval workflow",
      "Analytics + CSV exports",
      "Unlimited values + badges",
      "Priority email support",
    ],
    cta: "Upgrade to Pro",
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    tagline: "For 500+ teams and regulated industries",
    pricePerSeatMonthly: 0, // custom
    currency: "INR",
    seatLimit: null,
    features: [
      "Everything in Pro",
      "SSO / SAML / SCIM",
      "Dedicated success manager",
      "Custom SLA",
      "Private rewards (own merchants + direct brand deals)",
      "Advanced security + data residency",
      "Audit log export to SIEM",
    ],
    cta: "Contact sales",
  },
};

export function planFor(key: string): Plan {
  return PLANS[(key as PlanKey) in PLANS ? (key as PlanKey) : "free"];
}

export function isAtSeatLimit(plan: string, seatCount: number): boolean {
  const p = planFor(plan);
  if (p.seatLimit === null) return false;
  return seatCount >= p.seatLimit;
}

export function seatsRemaining(plan: string, seatCount: number): number | null {
  const p = planFor(plan);
  if (p.seatLimit === null) return null;
  return Math.max(0, p.seatLimit - seatCount);
}
