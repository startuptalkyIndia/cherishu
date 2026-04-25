import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketingShell from "@/components/MarketingShell";

export const metadata = {
  title: "FAQ — Cherishu",
  description: "Common questions about Cherishu's recognition platform — pricing, integrations, security, rewards, billing.",
};

const SECTIONS = [
  {
    title: "Getting started",
    qs: [
      { q: "How long does it take to set up Cherishu?", a: "About 5 minutes. Sign up, invite a few teammates, customize 4 default values + 4 default badges, and you're ready to send your first kudos. Slack/Teams takes another 2 minutes to wire up." },
      { q: "Can I import users from a spreadsheet?", a: "Yes — paste a CSV (name, email, password, role, jobTitle, department) into HR admin → Users → Import. We'll create the accounts and send welcome emails (if enabled)." },
      { q: "Do I need to give everyone a temporary password?", a: "Yes for now (set during user creation). Magic-link login is on the roadmap. SSO is available on Enterprise." },
    ],
  },
  {
    title: "Pricing & billing",
    qs: [
      { q: "What does 'per active user' mean?", a: "Active = isActive=true and not a demo user (`@demo.*` accounts excluded). Disabled users don't count toward your bill." },
      { q: "How does billing work?", a: "Razorpay handles the subscription. We bill at the start of each billing period based on your seat count. Adding/removing seats prorates the next invoice." },
      { q: "Can I get an invoice for accounting?", a: "Yes — every payment generates a Razorpay invoice with your billing email. GST-registered businesses get a GST invoice automatically." },
      { q: "Do you offer discounts for non-profits / education?", a: "Yes — 50% off Pro and special Enterprise terms for registered non-profits and educational institutions. Email sales@cherishu.talkytools.com." },
    ],
  },
  {
    title: "Rewards & redemption",
    qs: [
      { q: "Where do the actual gift cards come from?", a: "It depends on the provider you connect. Xoxoday gives access to 5,000+ brands across 100+ countries. Tremendous covers gift cards + PayPal/Venmo/bank transfers (US-focused). Amazon Incentives gives direct Amazon gift cards. Giftbit covers North America. You can also fulfill manually (you generate the voucher) or use the Marketplace model (the brand fulfills directly and you take a commission)." },
      { q: "What if a redemption fails?", a: "Points are automatically refunded to the employee's wallet. The redemption is marked FAILED with the provider's error message. HR sees it in the redemption queue." },
      { q: "Can employees redeem for cash?", a: "Yes via Tremendous (PayPal/Venmo/UPI/bank transfer) on Pro+. We don't directly disburse cash from Cherishu." },
    ],
  },
  {
    title: "Integrations",
    qs: [
      { q: "How does the Slack integration work?", a: "You paste an Incoming Webhook URL from your Slack workspace into HR admin → Settings → Slack/Teams. Every kudos (or auto-kudos, or awarded nomination — toggleable) gets posted as a rich message to that channel. Takes 2 minutes." },
      { q: "Do you support Microsoft Teams?", a: "Yes. Same flow as Slack — paste an incoming webhook URL. We render as Teams MessageCards." },
      { q: "What about a full Slack app (slash commands)?", a: "On the roadmap. Today's webhook covers 95% of use cases — kudos appear in the channel and people react/reply there. The full OAuth app with /kudos slash commands is planned for next quarter." },
    ],
  },
  {
    title: "Admin & permissions",
    qs: [
      { q: "What's the difference between Manager and HR Admin?", a: "Manager: sees own team's recognition activity (the /dashboard/team view). Cannot manage settings, rewards, or other users. HR Admin: full control over the workspace — users, rewards, redemptions, nominations, settings, billing, activity log." },
      { q: "Can I have multiple HR admins?", a: "Yes, unlimited. Promote any user from HR admin → Users → role dropdown." },
      { q: "Who can see private kudos?", a: "Only the sender, receiver, and HR admins. Private kudos still award points but don't show in the public feed and don't post to chat integrations." },
    ],
  },
];

export default function FaqPage() {
  return (
    <MarketingShell>
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Frequently asked questions</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">Real answers to real questions. If yours isn&apos;t here, ask us.</p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16 space-y-10">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{s.title}</h2>
            <div className="space-y-2">
              {s.qs.map((q) => (
                <details key={q.q} className="bg-white rounded-xl border border-gray-200 p-4 group">
                  <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between list-none">
                    <span>{q.q}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition shrink-0 ml-2" />
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{q.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-gray-50 py-16 border-t border-gray-200 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900">Still curious?</h2>
          <p className="mt-3 text-gray-600">Send us your question — a real human responds within a business day.</p>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Ask us anything <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
