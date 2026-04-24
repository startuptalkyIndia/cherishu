"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Trash2 } from "lucide-react";
import { REWARD_TYPE_META } from "@/lib/reward-providers";

const PROVIDERS = ["MANUAL", "XOXODAY", "TREMENDOUS", "AMAZON_INCENTIVES", "GIFTBIT", "CUSTOM_API"];
const TYPES = Object.keys(REWARD_TYPE_META);

type R = { id: string; name: string; description: string | null; type: string; provider: string; pointsCost: number; currencyValue: number | null; currency: string; isActive: boolean; featured: boolean; category: string | null };

export default function PlatformRewardsAdmin({ rewards: initial }: { rewards: R[] }) {
  const router = useRouter();
  const [rewards, setRewards] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", description: "", type: "GIFT_CARD", provider: "MANUAL", pointsCost: 500, currencyValue: 500, currency: "INR", featured: false, category: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    const res = await fetch("/api/sup-min/rewards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error || "Failed");
    setRewards([data.reward, ...rewards]);
    setOpen(false);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this platform reward?")) return;
    await fetch(`/api/sup-min/rewards/${id}`, { method: "DELETE" });
    setRewards(rewards.filter(r => r.id !== id));
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/sup-min/rewards/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    setRewards(rewards.map(r => r.id === id ? { ...r, isActive: !isActive } : r));
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add platform reward
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Name</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Type</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Provider</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Points</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Value</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm text-gray-900 font-medium">
                  {r.name}{r.featured && <span className="ml-2 text-xs text-yellow-700">★</span>}
                </td>
                <td className="px-3 py-3 text-sm text-gray-700">{REWARD_TYPE_META[r.type]?.emoji} {REWARD_TYPE_META[r.type]?.label || r.type}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{r.provider}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{r.pointsCost.toLocaleString()}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{r.currencyValue ? `${r.currency} ${r.currencyValue}` : "—"}</td>
                <td className="px-3 py-3">
                  <button onClick={() => toggle(r.id, r.isActive)} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {r.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-3 py-3 text-right">
                  <button onClick={() => remove(r.id)} className="text-xs text-red-600 hover:text-red-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {rewards.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-gray-500">No platform rewards yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add platform reward</h3>
            <form onSubmit={create} className="space-y-3">
              <F label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    {TYPES.map(t => <option key={t} value={t}>{REWARD_TYPE_META[t].emoji} {REWARD_TYPE_META[t].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Provider</label>
                  <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <F label="Cost" type="number" value={String(form.pointsCost)} onChange={(v) => setForm({ ...form, pointsCost: parseInt(v || "0") })} />
                <F label="Value" type="number" value={String(form.currencyValue)} onChange={(v) => setForm({ ...form, currencyValue: parseFloat(v || "0") })} />
                <F label="Currency" value={form.currency} onChange={(v) => setForm({ ...form, currency: v.toUpperCase() })} />
              </div>
              <F label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
              {err && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{err}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-300">Cancel</button>
                <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function F({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
