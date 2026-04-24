"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, Loader2 } from "lucide-react";

type M = {
  id: string; name: string; slug: string; contactEmail: string;
  commissionPercent: number; handoffMethod: string; isActive: boolean;
  rewardCount: number; redemptionCount: number; earnings: number;
};

export default function MerchantsList({ initial }: { initial: M[] }) {
  const router = useRouter();
  const [merchants, setMerchants] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    commissionPercent: 10,
    handoffMethod: "email",
    webhookUrl: "",
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    const res = await fetch("/api/sup-min/merchants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error || "Failed");
    setMerchants([data.merchant, ...merchants]);
    setOpen(false);
    setForm({ name: "", contactEmail: "", contactPhone: "", commissionPercent: 10, handoffMethod: "email", webhookUrl: "" });
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add merchant
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Merchant</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Contact</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Commission</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Handoff</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Products</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Orders</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Earned</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm text-gray-900 font-medium">
                  {m.name}
                  <div className="text-xs text-gray-500"><code className="bg-gray-100 px-1 py-0.5 rounded">{m.slug}</code></div>
                </td>
                <td className="px-3 py-3 text-sm text-gray-700">{m.contactEmail}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{m.commissionPercent}%</td>
                <td className="px-3 py-3 text-sm text-gray-700"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{m.handoffMethod}</span></td>
                <td className="px-3 py-3 text-sm text-gray-700">{m.rewardCount}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{m.redemptionCount}</td>
                <td className="px-3 py-3 text-sm font-semibold text-green-700">₹{m.earnings.toFixed(0)}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {m.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <Link href={`/sup-min/merchants/${m.id}`} className="text-xs text-indigo-600 hover:text-indigo-800">Manage →</Link>
                </td>
              </tr>
            ))}
            {merchants.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-12 text-center text-sm text-gray-500">
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-2xl">🏪</div>
                  <div className="font-medium text-gray-900">No merchants yet</div>
                  <div className="text-xs text-gray-500">Add your first partner brand (FNP, Interflora, etc.) to list their products.</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add merchant</h3>
            <form onSubmit={create} className="space-y-3">
              <F label="Merchant name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required placeholder="Ferns N Petals" />
              <F label="Contact email" type="email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} required placeholder="partners@fnp.com" />
              <F label="Contact phone (optional)" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} />
              <div className="grid grid-cols-2 gap-3">
                <F label="Commission (%)" type="number" value={String(form.commissionPercent)} onChange={(v) => setForm({ ...form, commissionPercent: parseFloat(v || "0") })} />
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Order handoff</label>
                  <select value={form.handoffMethod} onChange={(e) => setForm({ ...form, handoffMethod: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="email">Email</option>
                    <option value="webhook">Webhook</option>
                    <option value="manual">Manual (call/whatsapp)</option>
                  </select>
                </div>
              </div>
              {form.handoffMethod === "webhook" && (
                <F label="Webhook URL" value={form.webhookUrl} onChange={(v) => setForm({ ...form, webhookUrl: v })} placeholder="https://fnp.com/api/cherishu-orders" />
              )}
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

function F({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} required={required} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
