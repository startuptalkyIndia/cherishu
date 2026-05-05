import Link from "next/link";
import { Heart, Gift, MessageSquare, Cake, BarChart3, Shield, Store } from "lucide-react";
import MarketingShell from "@/components/MarketingShell";

export const metadata = {
  title: "Features — Cherishu",
  description: "Every feature you need for employee recognition: peer kudos, rewards, integrations, analytics, marketplace, billing.",
};

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Every feature you'd actually use</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">No fluff. No "AI-powered sentiment analysis" gimmicks. Just the things that make recognition stick.</p>
      </section>

      <Section
        eyebrow="Recognition"
        icon={Heart}
        color="rose"
        title="Peer-to-peer kudos that go viral inside your team"
        description="Send a kudos in 10 seconds with one of 8 quick templates. Tag company values + badges. Award points. The whole team reacts and comments — it's a feed, not a black hole."
        bullets={[
          "8 quick-templates · custom message · markdown formatting",
          "Tag a company value + a badge · tag is server-side and counted in analytics",
          "Reactions (7 emojis) + threaded comments per kudos",
          "Public or private — manager-only kudos when you need to be discreet",
        ]}
      />

      <Section
        reverse
        eyebrow="Auto-kudos"
        icon={Cake}
        color="pink"
        title="Birthdays and work anniversaries celebrated automatically"
        description="Daily cron at 9am IST scans every workspace and posts kudos for that day's birthdays + work anniversaries. Customizable message templates with {name} and {years} placeholders. Award points on autopilot."
        bullets={[
          "Daily UTC scan · idempotent (won't duplicate)",
          "HR can customize point amount + message per workspace",
          "Renders distinctly in feed (🎂 / 🎉 avatar instead of sender's initials)",
          "Posts to Slack / Teams + sends email — same as peer kudos",
        ]}
      />

      <Section
        eyebrow="Rewards"
        icon={Gift}
        color="indigo"
        title="A reward catalog that's actually flexible"
        description="9 reward types (gift cards, experiences, merchandise, cashback, charity, swag, vouchers, subscriptions, travel). 6 fulfillment providers (Manual, Marketplace, Xoxoday, Tremendous, Amazon Incentives, Giftbit). Mix and match per reward."
        bullets={[
          "Search · filter by type · sort by cost · 'Can afford only' filter",
          "Provider abstraction — swap fulfillment vendors without rebuilding the catalog",
          "Auto-fulfillment for connected providers (instant voucher email)",
          "Manual fulfillment queue for HR-handled rewards",
          "Auto-refund on provider failure · stock tracking · featured rewards",
        ]}
      />

      <Section
        reverse
        eyebrow="Marketplace"
        icon={Store}
        color="purple"
        title="List partner brands. They fulfill. You earn commission."
        description="Don't want to be a reseller? Operate as a marketplace. FNP, Interflora, your local boutique — list their products, route orders directly to them, collect a per-order commission. Cherishu handles zero inventory."
        bullets={[
          "Per-merchant catalog import via CSV (name, SKU, price, image, etc.)",
          "Order handoff via email, webhook, or manual — your choice per merchant",
          "Per-order commission snapshot · earnings dashboard per merchant",
          "Shipping address collected at redemption · sent with order to merchant",
        ]}
      />

      <Section
        eyebrow="Integrations"
        icon={MessageSquare}
        color="blue"
        title="Lives where your team works"
        description="Cherishu pushes recognition into Slack, Teams, Discord — wherever your team chats. Email notifications + weekly HR digest. Razorpay billing. Resend for transactional emails."
        bullets={[
          "Slack Block Kit · Teams MessageCard · Discord embeds · generic webhooks",
          "5 email types (welcome, kudos, redemption, nomination, weekly digest)",
          "Razorpay subscription billing · webhook-driven status updates",
          "Per-workspace toggle for every notification type",
        ]}
      />

      <Section
        reverse
        eyebrow="Analytics & admin"
        icon={BarChart3}
        color="green"
        title="HR and managers actually find what they need"
        description="Daily kudos chart. Top values lived. Department breakdown. CSV exports for everything. Manager view shows direct reports' activity with low-engagement warnings."
        bullets={[
          "Filter + paginate every list · 50/page on tables, 24/page on rewards",
          "CSV exports: recognitions, redemptions, users — all timestamped",
          "Audit log: every config change + role change + redemption decision",
          "Manager console: direct reports + per-person stats + 'no activity' alerts",
        ]}
      />

      <Section
        eyebrow="Security & control"
        icon={Shield}
        color="gray"
        title="Built like a SaaS your security team will sign off on"
        description="Per-workspace data isolation. Role-based access. Audit log on every meaningful action. Bcrypt password hashing. Razorpay webhook signature verification. Hidden super admin route with noindex."
        bullets={[
          "Multi-tenant — workspaces never see each other's data",
          "Roles: Employee · Manager · HR Admin · Super Admin",
          "Comprehensive audit log per workspace",
          "Free tier seat enforcement · plan-gated features",
        ]}
      />

      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to see it live?</h2>
          <p className="mt-3 text-indigo-100">Start free, or book a 20-minute demo.</p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/signup" className="bg-white text-indigo-600 px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-50">Start free</Link>
            <Link href="/contact" className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/20 border border-white/30">Book demo</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function Section({ eyebrow, icon: Icon, color, title, description, bullets, reverse = false }: {
  eyebrow: string; icon: any; color: string; title: string; description: string; bullets: string[]; reverse?: boolean;
}) {
  const colors: Record<string, string> = {
    rose: "bg-rose-50 text-rose-600",
    pink: "bg-pink-50 text-pink-600",
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <section className="py-16 border-t border-gray-100">
      <div className={`max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${reverse ? "md:flex-row-reverse" : ""}`}>
        <div className={reverse ? "md:order-2" : ""}>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" /> {eyebrow}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">{title}</h2>
          <p className="mt-4 text-gray-600 text-base leading-relaxed">{description}</p>
          <ul className="mt-5 space-y-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-indigo-600 mt-1">•</span> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8 aspect-square max-w-sm ${reverse ? "md:order-1" : ""} flex items-center justify-center`}>
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-12 h-12" />
          </div>
        </div>
      </div>
    </section>
  );
}
