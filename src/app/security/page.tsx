import Link from "next/link";
import { Shield, Lock, Eye, Database, Users, FileCheck, Globe, AlertTriangle, ArrowRight } from "lucide-react";
import MarketingShell from "@/components/MarketingShell";

export const metadata = {
  title: "Security — Cherishu",
  description: "How Cherishu protects your data: encryption, multi-tenant isolation, audit log, GDPR compliance, and our path to SOC 2.",
};

export default function SecurityPage() {
  return (
    <MarketingShell>
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-4">
          <Shield className="w-3.5 h-3.5" /> Security & trust
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Built to be trusted by your security team</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Cherishu handles employee data, including birthdays, manager hierarchies, and reward redemptions. Here&apos;s exactly how we keep it safe — no marketing fog.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Pillar icon={Lock} title="Encryption everywhere" body="HTTPS / TLS 1.2+ for all traffic. Bcrypt for password hashing (cost 10). Database connections always over TLS in production." />
          <Pillar icon={Database} title="Multi-tenant isolation" body="Every query is scoped by workspace. Workspaces never see each other's data. Even our super admin sees only aggregate stats by default." />
          <Pillar icon={FileCheck} title="Audit log" body="Every meaningful action — user invited, role changed, reward deleted, redemption fulfilled, plan changed — is logged with actor + timestamp + workspace context." />
          <Pillar icon={Eye} title="Hidden super admin" body="Platform admin lives at /sup-min, never linked from the public app, X-Robots-Tag set to noindex. Login attempts are signed-cookie based, not part of regular Auth.js." />
          <Pillar icon={Users} title="Role-based access" body="Employee, Manager, HR Admin, Super Admin. Every API route has a role check. No backdoors." />
          <Pillar icon={Globe} title="Data residency" body="All production data lives in AWS Mumbai (ap-south-1). Custom regions available on Enterprise plans." />
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How we handle data</h2>
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <Block title="What we collect">
              Names, work emails, optional birthdays + work anniversary dates, kudos messages, reaction emojis, redemption history, and shipping addresses (only when redeeming physical/marketplace rewards). That&apos;s it. We do not collect home addresses, phone numbers (unless explicitly provided for shipping), or any sensitive personal data.
            </Block>
            <Block title="How we store it">
              PostgreSQL database hosted on AWS Mumbai. Daily backups. Point-in-time recovery on Pro+. Database is not exposed to the internet — only the application server can reach it.
            </Block>
            <Block title="What we share with third parties">
              Only what's needed for the features you turn on:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Resend</strong> — to send transactional emails (we share recipient email + email body)</li>
                <li><strong>Razorpay</strong> — to process subscription payments (we share billing email + payment amount)</li>
                <li><strong>Reward providers</strong> (Xoxoday/Tremendous/Amazon Incentives/Giftbit) — only when an employee redeems a reward (we share the recipient email + reward SKU)</li>
                <li><strong>Marketplace merchants</strong> — only the order details for orders the employee places (recipient name, shipping address, product SKU)</li>
                <li><strong>Slack/Teams/Discord</strong> — only the kudos content + sender/receiver names that you opt to push</li>
              </ul>
              We do not sell data. We do not run ads. We have no analytics or tracking pixels of any kind.
            </Block>
            <Block title="Account deletion">
              Workspace owners can request full deletion at any time by emailing <a href="mailto:privacy@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800">privacy@cherishu.talkytools.com</a>. We delete all production data within 30 days; backups expire within 90 days.
            </Block>
            <Block title="Compliance roadmap">
              Cherishu is GDPR-aligned today (data export, deletion-on-request, audit log). SOC 2 Type II is on the roadmap for Q4 2026. ISO 27001 thereafter. Talk to us for the current letter.
            </Block>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900">Spotted something?</h3>
            <p className="text-sm text-gray-700 mt-1">
              Found a security issue? Email <a href="mailto:security@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800 font-medium">security@cherishu.talkytools.com</a>. We respond within 24 hours and confirm fixes via the same channel. We don&apos;t have a bug bounty yet — but we do say thank you publicly (with permission).
            </p>
          </div>
        </div>
      </section>

      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Need our security paperwork?</h2>
          <p className="mt-3 text-indigo-100">DPA · privacy commitment letter · SOC 2 progress · custom MSA — reach out.</p>
          <Link href="/contact?topic=security" className="mt-6 inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-50">
            Contact security team <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}

function Pillar({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
