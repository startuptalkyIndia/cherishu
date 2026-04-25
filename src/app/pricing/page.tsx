import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import MarketingShell from "@/components/MarketingShell";
import { PLANS } from "@/lib/plans";

export const metadata = {
  title: "Pricing — Cherishu",
  description: "Free for up to 10 users. Pro at ₹199/user/month. Enterprise tailored. Cancel anytime.",
};

const COMPARE = [
  { section: "Recognition" },
  { feature: "Peer kudos with points", free: true, pro: true, enterprise: true },
  { feature: "Custom company values + badges", free: "4 default", pro: "unlimited", enterprise: "unlimited" },
  { feature: "Reactions + comments on feed", free: true, pro: true, enterprise: true },
  { feature: "Recognition templates", free: true, pro: true, enterprise: true },
  { feature: "Nominations + HR approval flow", free: false, pro: true, enterprise: true },
  { feature: "Birthday + work anniversary auto-kudos", free: false, pro: true, enterprise: true },

  { section: "Rewards" },
  { feature: "Manual rewards catalog", free: true, pro: true, enterprise: true },
  { feature: "9 reward types (gift cards, experiences, etc.)", free: false, pro: true, enterprise: true },
  { feature: "Provider integrations (Xoxoday/Tremendous/Amazon/Giftbit)", free: false, pro: true, enterprise: true },
  { feature: "Marketplace (your own merchants)", free: false, pro: true, enterprise: true },

  { section: "Integrations" },
  { feature: "Slack / Microsoft Teams / Discord", free: false, pro: true, enterprise: true },
  { feature: "Email notifications + weekly digest", free: false, pro: true, enterprise: true },
  { feature: "REST API + webhooks", free: false, pro: false, enterprise: true },
  { feature: "HRIS sync (BambooHR, Rippling)", free: false, pro: false, enterprise: true },

  { section: "Admin & analytics" },
  { feature: "User management + bulk CSV import", free: true, pro: true, enterprise: true },
  { feature: "HR analytics + CSV exports", free: false, pro: true, enterprise: true },
  { feature: "Manager console (direct reports view)", free: false, pro: true, enterprise: true },
  { feature: "Activity log (audit trail)", free: false, pro: true, enterprise: true },
  { feature: "Filters + pagination on every list", free: true, pro: true, enterprise: true },

  { section: "Security & support" },
  { feature: "Email support", free: "community", pro: "priority", enterprise: "dedicated CSM" },
  { feature: "SSO / SAML / SCIM", free: false, pro: false, enterprise: true },
  { feature: "Custom SLA + data residency", free: false, pro: false, enterprise: true },
  { feature: "Audit log export to SIEM", free: false, pro: false, enterprise: true },
];

const FAQS = [
  {
    q: "How does the per-user pricing work on Pro?",
    a: "We bill ₹199 per active user per month. Inactive/disabled users don't count. There's no minimum and you can add or remove seats anytime — Razorpay prorates the next bill.",
  },
  {
    q: "Is the 14-day Pro trial really no-credit-card?",
    a: "Yes. New Pro upgrades start with a 14-day trial. We only ask for billing details when you decide to keep going.",
  },
  {
    q: "What happens when I hit the 10-user limit on Free?",
    a: "Existing users keep working. You just can't add an 11th until you upgrade. We'll never silently drop users.",
  },
  {
    q: "Do reward redemptions cost me extra?",
    a: "It depends on the provider. Manual rewards (your own swag, charity donations, custom vouchers) are free to fulfill. Provider-fulfilled rewards (Xoxoday, Amazon, etc.) bill at face value to your provider account — Cherishu doesn't add any markup. Marketplace orders go straight to the merchant; you can negotiate the commission you take.",
  },
  {
    q: "Can I switch between Pro and Enterprise?",
    a: "Yes. Pro upgrades to Enterprise are immediate; Enterprise to Pro takes effect at your next billing period. Talk to us — we'll walk you through it.",
  },
  {
    q: "Is my data isolated between workspaces?",
    a: "Always. Every workspace is fully isolated at the database level. Even our super admin only sees aggregate stats by default; reading workspace-specific data requires explicit access logging.",
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Simple, transparent pricing</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">Free for small teams. Pay-as-you-grow when you need more. No surprises.</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {(["free", "pro", "enterprise"] as const).map((key) => {
            const p = PLANS[key];
            return (
              <div key={key} className={`rounded-2xl p-6 flex flex-col ${p.featured ? "border-2 border-indigo-600 bg-white relative shadow-lg" : "border border-gray-200 bg-white"}`}>
                {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs rounded-full font-medium">Most popular</div>}
                <h3 className="text-2xl font-bold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">{p.tagline}</p>
                <div className="mb-4">
                  {p.key === "enterprise" ? (
                    <>
                      <div className="text-3xl font-bold text-gray-900">Custom</div>
                      <div className="text-sm text-gray-500">Tailored to your team</div>
                    </>
                  ) : p.pricePerSeatMonthly === 0 ? (
                    <>
                      <div className="text-4xl font-bold text-gray-900">₹0</div>
                      <div className="text-sm text-gray-500">forever</div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-gray-900">₹{p.pricePerSeatMonthly}<span className="text-base font-normal text-gray-500"> / user</span></div>
                      <div className="text-sm text-gray-500">per month, billed monthly</div>
                    </>
                  )}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                  {p.notIncluded?.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                      <X className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {p.key === "enterprise" ? (
                  <Link href="/contact?plan=enterprise" className="w-full block text-center bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
                    {p.cta}
                  </Link>
                ) : (
                  <Link href="/signup" className={`w-full block text-center py-2.5 rounded-lg text-sm font-medium ${p.featured ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"}`}>
                    {p.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">All plans include unlimited recognitions and unlimited comments/reactions. No setup fees. Cancel anytime.</p>
      </section>

      {/* Comparison table */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Compare plans</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-1/2">Feature</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Free</th>
                <th className="px-4 py-3 text-xs font-semibold text-indigo-600 uppercase tracking-wide text-center">Pro</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) =>
                "section" in row ? (
                  <tr key={i} className="bg-gray-50">
                    <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">{row.section}</td>
                  </tr>
                ) : (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-700">{row.feature}</td>
                    <td className="px-4 py-3 text-center"><Cell value={row.free} /></td>
                    <td className="px-4 py-3 text-center bg-indigo-50/40"><Cell value={row.pro} /></td>
                    <td className="px-4 py-3 text-center"><Cell value={row.enterprise} /></td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Pricing FAQ</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="bg-white rounded-xl border border-gray-200 p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between list-none">
                <span>{f.q}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Still deciding?</h2>
          <p className="mt-3 text-gray-600">Get a 20-minute walkthrough with a real person. No demo robots.</p>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Book a demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-5 h-5 text-indigo-600 mx-auto" />;
  if (value === false) return <span className="text-gray-300">—</span>;
  return <span className="text-xs text-gray-700">{value}</span>;
}
