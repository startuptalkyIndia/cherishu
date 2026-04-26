import MarketingShell from "@/components/MarketingShell";

export const metadata = {
  title: "Refund & Cancellation — Cherishu",
  description: "Cherishu's refund and subscription cancellation policy.",
};

export default function RefundPage() {
  return (
    <MarketingShell>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Refund &amp; Cancellation Policy</h1>
        <p className="text-sm text-gray-500">Last updated: 26 April 2026</p>

        <p className="mt-6 text-gray-700 leading-relaxed">
          We want you to feel confident in your purchase. Here&apos;s how refunds and cancellations work on Cherishu.
        </p>

        <Section title="1. Free plan">
          <p>The Free plan is free forever for up to 10 active users. There&apos;s nothing to refund.</p>
        </Section>

        <Section title="2. Pro plan trial">
          <p>Pro upgrades begin with a 14-day free trial — no card required. During the trial you have full access. If you don&apos;t want to continue, your workspace automatically returns to the Free plan when the trial ends. No charge, no need to cancel.</p>
        </Section>

        <Section title="3. Pro plan paid subscriptions">
          <ul className="list-disc pl-6 space-y-1.5">
            <li><strong>Cancellation:</strong> Cancel anytime from <code>/admin/billing</code>. Cancellation takes effect at the end of your current billing cycle — you keep Pro features until then.</li>
            <li><strong>Pro-rated refund:</strong> Within 7 days of your first paid charge, we&apos;ll refund the unused portion if you&apos;ve made fewer than 50 recognitions in that period.</li>
            <li><strong>Mid-cycle changes:</strong> Adding or removing seats prorates the next bill, not the current one. We don&apos;t refund mid-cycle for seat reductions.</li>
            <li><strong>Annual plans</strong> (Enterprise): refunds are governed by your Order Form.</li>
          </ul>
        </Section>

        <Section title="4. Refunds for redeemed rewards">
          <p>Reward redemptions are <strong>final</strong> once a voucher has been issued or an order has been handed off to a merchant. If a provider integration fails (e.g., Xoxoday returns an error), points are <strong>automatically refunded</strong> to the employee&apos;s wallet — no action needed from you.</p>
          <p>For marketplace orders (FNP, Interflora, etc.), delivery defects and product disputes are handled by the merchant directly per their own refund policy. Cherishu can mediate but is not the merchant of record.</p>
        </Section>

        <Section title="5. How to request a refund">
          <p>Email <a href="mailto:billing@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800">billing@cherishu.talkytools.com</a> from the email address registered on your Cherishu workspace. Include your workspace slug and the date of the transaction. We respond within 2 business days; approved refunds are credited via Razorpay within 5–10 business days.</p>
        </Section>

        <Section title="6. Chargebacks">
          <p>If you initiate a chargeback without contacting us first, we may suspend the workspace until the dispute is resolved. Please email us first — we&apos;d much rather sort it out together.</p>
        </Section>

        <Section title="7. Contact">
          <p>Billing questions: <a href="mailto:billing@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800">billing@cherishu.talkytools.com</a></p>
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
