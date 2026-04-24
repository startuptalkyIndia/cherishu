"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SettingsForm({ workspace, values, badges }: { workspace: any; values: any[]; badges: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: workspace.name,
    monthlyBudgetPoints: workspace.monthlyBudgetPoints,
    currency: workspace.currency,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/workspace", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Company</h2>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Company name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Workspace slug</label>
          <input value={workspace.slug} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Monthly budget (points)</label>
            <input type="number" min={0} value={form.monthlyBudgetPoints} onChange={(e) => setForm({ ...form, monthlyBudgetPoints: parseInt(e.target.value || "0") })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
            <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end items-center gap-3">
          {saved && <span className="text-sm text-green-700">Saved ✓</span>}
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Company Values</h3>
          <div className="space-y-2">
            {values.map((v) => (
              <div key={v.id} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 bg-gray-50 rounded-lg">
                <span className="text-lg">{v.emoji}</span>
                <span className="font-medium">{v.name}</span>
              </div>
            ))}
            {values.length === 0 && <p className="text-sm text-gray-500">No values yet.</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Badges</h3>
          <div className="space-y-2">
            {badges.map((b) => (
              <div key={b.id} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 bg-gray-50 rounded-lg">
                <span className="text-lg">{b.emoji}</span>
                <span className="font-medium">{b.name}</span>
              </div>
            ))}
            {badges.length === 0 && <p className="text-sm text-gray-500">No badges yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
