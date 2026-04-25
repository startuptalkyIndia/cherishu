"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";

export default function BillingClient({ currentPlan, subscriptionStatus, seatCount, workspaceId, billingEmail: initBillingEmail }: {
  currentPlan: string;
  subscriptionStatus: string | null;
  seatCount: number;
  workspaceId: string;
  billingEmail: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initBillingEmail);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/billing/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billingEmail: email }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Mail className="w-5 h-5 text-indigo-600" /> Billing contact
      </h3>
      <p className="text-xs text-gray-500 mb-3">Invoices and renewal notices go to this email.</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button onClick={save} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
        </button>
        {saved && <span className="self-center text-sm text-green-700">✓</span>}
      </div>
    </div>
  );
}
