"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Settings } from "lucide-react";
import { REWARD_TYPE_META } from "@/lib/reward-providers";

const PROVIDERS = ["MANUAL", "XOXODAY", "TREMENDOUS", "AMAZON_INCENTIVES", "GIFTBIT", "CUSTOM_API"] as const;
const TYPES = Object.keys(REWARD_TYPE_META);

type Reward = { id: string; name: string; type: string; provider: string; pointsCost: number; currencyValue: number | null; currency: string; isActive: boolean; featured: boolean; workspaceScoped: boolean };
type ProviderConfig = { provider: string; isEnabled: boolean; hasKey: boolean };

export default function RewardsAdmin({ rewards: initial, providerConfigs }: { rewards: Reward[]; providerConfigs: ProviderConfig[] }) {
  const router = useRouter();
  const [rewards, setRewards] = useState(initial);
  const [tab, setTab] = useState<"catalog" | "providers">("catalog");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", type: "GIFT_CARD", provider: "MANUAL", pointsCost: 500, currencyValue: 100, currency: "INR", featured: false,
  });

  async function createReward(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    const res = await fetch("/api/admin/rewards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error || "Failed");
    setRewards([data.reward, ...rewards]);
    setOpen(false);
    setForm({ name: "", description: "", type: "GIFT_CARD", provider: "MANUAL", pointsCost: 500, currencyValue: 100, currency: "INR", featured: false });
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/rewards/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    setRewards(rewards.map((r) => r.id === id ? { ...r, isActive: !isActive } : r));
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
        <button onClick={() => setTab("catalog")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "catalog" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
          Catalog
        </button>
        <button onClick={() => setTab("providers")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "providers" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
          Providers
        </button>
      </div>

      {tab === "catalog" && (
        <>
          <div className="flex justify-end mb-3">
            <button onClick={() => setOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add reward
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
                      {!r.workspaceScoped && <span className="ml-2 text-xs text-gray-400">(platform)</span>}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">{REWARD_TYPE_META[r.type]?.emoji} {REWARD_TYPE_META[r.type]?.label}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{r.provider}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{r.pointsCost.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{r.currencyValue ? `${r.currency} ${r.currencyValue}` : "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {r.workspaceScoped && (
                        <button onClick={() => toggleActive(r.id, r.isActive)} className="text-xs text-indigo-600 hover:text-indigo-800">
                          {r.isActive ? "Disable" : "Enable"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "providers" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-3">Configure API keys to fulfill rewards automatically. Leave disabled to handle fulfillment manually.</p>
          {PROVIDERS.map((p) => {
            const cfg = providerConfigs.find((c) => c.provider === p);
            return (
              <ProviderCard key={p} name={p} isEnabled={cfg?.isEnabled || false} hasKey={cfg?.hasKey || false} />
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add reward</h3>
            <form onSubmit={createReward} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    {TYPES.map((t) => <option key={t} value={t}>{REWARD_TYPE_META[t].emoji} {REWARD_TYPE_META[t].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Provider</label>
                  <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cost (pts)</label>
                  <input type="number" min={0} value={form.pointsCost} onChange={(e) => setForm({ ...form, pointsCost: parseInt(e.target.value || "0") })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                  <input type="number" min={0} value={form.currencyValue} onChange={(e) => setForm({ ...form, currencyValue: parseFloat(e.target.value || "0") })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
                  <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Feature this reward
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

function ProviderCard({ name, isEnabled, hasKey }: { name: string; isEnabled: boolean; hasKey: boolean }) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accountId, setAccountId] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function save() {
    setLoading(true);
    await fetch("/api/admin/provider-configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: name, apiKey, apiSecret, accountId, isEnabled: true }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); router.refresh(); }, 1500);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{name.replace(/_/g, " ")}</h4>
            {isEnabled && hasKey && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Connected</span>}
            {name === "MANUAL" && <span className="text-xs text-gray-500">(always available)</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {name === "MANUAL" && "Fulfill orders manually — voucher codes entered by admin."}
            {name === "XOXODAY" && "Global rewards catalog — 5,000+ brands across 100+ countries."}
            {name === "TREMENDOUS" && "Gift cards, PayPal, Venmo, bank transfers."}
            {name === "AMAZON_INCENTIVES" && "Direct Amazon gift cards via AGCOD."}
            {name === "GIFTBIT" && "North America focused gift card platform."}
            {name === "CUSTOM_API" && "Webhook-based integration to your own fulfillment service."}
          </p>
        </div>
        {name !== "MANUAL" && (
          <button onClick={() => setOpen(!open)} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 hover:bg-gray-200 flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" /> Configure
          </button>
        )}
      </div>
      {open && name !== "MANUAL" && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">API Key</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">API Secret</label>
            <input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Account / Org ID</label>
            <input value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            {saved && <span className="text-xs text-green-700 self-center">Saved ✓</span>}
            <button onClick={save} disabled={loading || !apiKey} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save & enable
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
