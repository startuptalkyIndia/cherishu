import { requireRole } from "@/lib/session";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StubCheckout({ searchParams: _searchParams }: { searchParams: Promise<{ workspace?: string; plan?: string }> }) {
  await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl p-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Trial mode
        </div>
        <h1 className="text-3xl font-bold mb-3">You&apos;re on Pro trial 🎉</h1>
        <p className="text-indigo-100 mb-6">
          Your workspace has been upgraded to Pro with a 14-day free trial. Full access to all features — no credit card required.
        </p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-left mb-6 text-sm">
          <p className="text-indigo-100 mb-2"><strong className="text-white">What&apos;s next:</strong></p>
          <ul className="space-y-1.5 text-indigo-50">
            <li>✓ Payments aren&apos;t connected yet — Razorpay keys haven&apos;t been set on the platform</li>
            <li>✓ Super admin can configure them at <code className="bg-white/20 px-1 rounded">/sup-min/platform-settings</code></li>
            <li>✓ Until then you&apos;ll stay on trial — no charge, full access</li>
          </ul>
        </div>
        <Link href="/admin/billing" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-50">
          Go to billing <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
