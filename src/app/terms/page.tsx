import MarketingShell from "@/components/MarketingShell";

export const metadata = {
  title: "Terms of Service — Cherishu",
  description: "Terms governing your use of Cherishu.",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: 26 April 2026</p>

        <p className="mt-6 text-gray-700 leading-relaxed">
          These Terms govern your use of Cherishu, an employee recognition and rewards platform operated by TalkyTools (&quot;we&quot;, &quot;us&quot;) from India. By signing up or using Cherishu, you agree to these Terms. If you don&apos;t agree, please don&apos;t use the service.
        </p>

        <Section title="1. Who can use Cherishu">
          <p>Cherishu is intended for workplace use by organizations and their employees aged 18 and above. The person who creates a workspace is the &quot;Workspace Owner&quot; and is responsible for the actions of all users they invite.</p>
        </Section>

        <Section title="2. Plans, billing, trial">
          <ul className="list-disc pl-6 space-y-1.5">
            <li>The Free plan supports up to 10 active users at no cost, indefinitely.</li>
            <li>Pro is billed monthly per active user via Razorpay. New Pro subscriptions begin with a 14-day free trial.</li>
            <li>Enterprise plans are governed by a separate Order Form.</li>
            <li>You&apos;re responsible for keeping your billing details accurate and your card valid. Failed payments may result in your workspace being downgraded to Free.</li>
          </ul>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Use Cherishu for harassment, hate speech, or content that violates Indian law.</li>
            <li>Attempt to access another workspace&apos;s data.</li>
            <li>Probe, scan, or attack our infrastructure (responsible disclosure to <a href="mailto:security@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800">security@cherishu.talkytools.com</a> is welcome).</li>
            <li>Resell the service without an authorized partnership.</li>
          </ul>
          <p>We may suspend or terminate access for violations.</p>
        </Section>

        <Section title="4. Your data">
          <p>You own the data you put into Cherishu. We store and process it on your behalf to provide the service. See our <a href="/privacy" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</a> for the full picture.</p>
        </Section>

        <Section title="5. Rewards and marketplace">
          <p>Reward catalog items are fulfilled either by Cherishu (manual fulfillment), by integrated providers (Xoxoday, Tremendous, Amazon Incentives, Giftbit), or by partner merchants in the marketplace model. Disputes about delivery, defective items, or refunds for marketplace orders are between the recipient and the merchant — see <a href="/refund" className="text-indigo-600 hover:text-indigo-800">Refund Policy</a>.</p>
        </Section>

        <Section title="6. Service availability">
          <p>We aim for 99.5% uptime but don&apos;t guarantee it on the Free plan. Pro and Enterprise plans receive an SLA — see your Order Form. Scheduled maintenance is announced via email at least 24 hours in advance.</p>
        </Section>

        <Section title="7. Limitation of liability">
          <p>To the maximum extent permitted by Indian law, our liability for any claim is limited to the amount you paid to Cherishu in the 12 months before the claim. We are not liable for indirect or consequential damages, lost profits, or loss of goodwill.</p>
        </Section>

        <Section title="8. Termination">
          <p>You may cancel your subscription anytime from <code>/admin/billing</code>. We may terminate accounts that violate these Terms or remain inactive on the Free plan for 12+ months (with notice). Data export is available before termination.</p>
        </Section>

        <Section title="9. Governing law">
          <p>These Terms are governed by the laws of India. Disputes will be resolved in the courts of Bengaluru, Karnataka.</p>
        </Section>

        <Section title="10. Changes">
          <p>We may update these Terms from time to time. Material changes will be communicated by email to workspace owners. The &quot;Last updated&quot; date at the top reflects the latest version.</p>
        </Section>

        <Section title="11. Contact">
          <p>Questions about these Terms: <a href="mailto:hello@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800">hello@cherishu.talkytools.com</a></p>
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
