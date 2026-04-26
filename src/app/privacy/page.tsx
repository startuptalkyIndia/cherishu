import MarketingShell from "@/components/MarketingShell";

export const metadata = {
  title: "Privacy Policy — Cherishu",
  description: "How Cherishu collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: 26 April 2026</p>

        <p className="mt-6 text-gray-700 leading-relaxed">
          Cherishu (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated by TalkyTools, based in India. This policy describes what data we collect, why, how we store it, and your rights. We&apos;ve tried to keep it short and plain — for the technical detail, see <a href="/security" className="text-indigo-600 hover:text-indigo-800">/security</a>.
        </p>

        <Section title="1. What we collect">
          <ul>
            <li><strong>Account data:</strong> name, work email, hashed password.</li>
            <li><strong>Profile data (optional):</strong> job title, department, birthday, work-anniversary date.</li>
            <li><strong>Usage data:</strong> recognitions sent/received, points awarded, reactions, comments.</li>
            <li><strong>Redemption data:</strong> rewards redeemed, voucher codes issued, shipping address (only when redeeming a physical or marketplace reward).</li>
            <li><strong>Billing data:</strong> billing email + Razorpay subscription metadata. We never store card numbers — that lives with Razorpay.</li>
          </ul>
          <p>We do <strong>not</strong> use any tracking pixels, advertising cookies, or third-party analytics on the public site.</p>
        </Section>

        <Section title="2. Why we collect it">
          <p>
            To run the recognition platform: deliver kudos, fulfill reward redemptions, generate analytics for HR admins, send transactional emails (welcome, kudos received, redemption fulfilled), and process subscription billing. That&apos;s it.
          </p>
        </Section>

        <Section title="3. Where it&apos;s stored">
          <p>
            Production data lives in a PostgreSQL database hosted on Amazon Web Services (Mumbai region, ap-south-1). Daily backups are retained for 30 days. The database is not exposed to the internet.
          </p>
        </Section>

        <Section title="4. Who we share with">
          <p>Only when needed for the features you turn on:</p>
          <ul>
            <li><strong>Resend</strong> — transactional emails (recipient address + email body)</li>
            <li><strong>Razorpay</strong> — subscription billing (billing email + amount)</li>
            <li><strong>Reward providers</strong> (Xoxoday, Tremendous, Amazon Incentives, Giftbit) — redemption details for the specific reward you redeem</li>
            <li><strong>Marketplace merchants</strong> — order details for orders you place (recipient name, shipping address, product SKU)</li>
            <li><strong>Slack / Microsoft Teams / Discord</strong> — recognition messages you opt to push to those channels</li>
          </ul>
          <p>We never sell data. We never run ads.</p>
        </Section>

        <Section title="5. Your rights">
          <ul>
            <li>You can view and download your data at any time (HR admin: CSV exports; individual users: <code>/dashboard/profile</code>).</li>
            <li>You can ask us to delete your account by emailing <a href="mailto:privacy@cherishu.talkytools.com">privacy@cherishu.talkytools.com</a>. We delete production data within 30 days; backups expire within 90 days.</li>
            <li>If you&apos;re an EU resident, you have GDPR rights of access, rectification, erasure, restriction, portability, and objection.</li>
          </ul>
        </Section>

        <Section title="6. Cookies">
          <p>
            We use a single first-party authentication cookie (HTTP-only, secure) to keep you logged in. No analytics cookies, no advertising cookies, no third-party scripts on the public site.
          </p>
        </Section>

        <Section title="7. Children">
          <p>Cherishu is for workplace use and is not directed to anyone under 18.</p>
        </Section>

        <Section title="8. Changes">
          <p>If we materially change this policy, we&apos;ll email workspace owners and post a notice on this page. Last update is at the top.</p>
        </Section>

        <Section title="9. Contact">
          <p>
            Privacy questions: <a href="mailto:privacy@cherishu.talkytools.com">privacy@cherishu.talkytools.com</a><br />
            Security disclosures: <a href="mailto:security@cherishu.talkytools.com">security@cherishu.talkytools.com</a><br />
            Anything else: <a href="mailto:hello@cherishu.talkytools.com">hello@cherishu.talkytools.com</a>
          </p>
        </Section>
      </article>
    </MarketingShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
