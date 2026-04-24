"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";

type V = { id: string; name: string; emoji: string; description: string | null };
type B = { id: string; name: string; emoji: string; color: string };

export default function ValuesAndBadges({ values: vInit, badges: bInit }: { values: V[]; badges: B[] }) {
  const router = useRouter();
  const [values, setValues] = useState(vInit);
  const [badges, setBadges] = useState(bInit);
  const [vForm, setVForm] = useState({ name: "", emoji: "⭐", description: "" });
  const [bForm, setBForm] = useState({ name: "", emoji: "🏆", color: "indigo" });
  const [loading, setLoading] = useState("");

  async function addValue(e: React.FormEvent) {
    e.preventDefault();
    setLoading("v");
    const res = await fetch("/api/admin/values", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vForm) });
    const data = await res.json();
    setLoading("");
    if (res.ok) {
      setValues([...values, data.value]);
      setVForm({ name: "", emoji: "⭐", description: "" });
      router.refresh();
    }
  }
  async function deleteValue(id: string) {
    await fetch(`/api/admin/values/${id}`, { method: "DELETE" });
    setValues(values.filter(v => v.id !== id));
  }
  async function addBadge(e: React.FormEvent) {
    e.preventDefault();
    setLoading("b");
    const res = await fetch("/api/admin/badges", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bForm) });
    const data = await res.json();
    setLoading("");
    if (res.ok) {
      setBadges([...badges, data.badge]);
      setBForm({ name: "", emoji: "🏆", color: "indigo" });
      router.refresh();
    }
  }
  async function deleteBadge(id: string) {
    await fetch(`/api/admin/badges/${id}`, { method: "DELETE" });
    setBadges(badges.filter(b => b.id !== id));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Values */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Company Values</h3>
        <div className="space-y-2 mb-4">
          {values.map(v => (
            <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <div>
                <div className="text-gray-900 font-medium">{v.emoji} {v.name}</div>
                {v.description && <div className="text-xs text-gray-500">{v.description}</div>}
              </div>
              <button onClick={() => deleteValue(v.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {values.length === 0 && <p className="text-sm text-gray-500">No values yet.</p>}
        </div>
        <form onSubmit={addValue} className="space-y-2 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-[60px_1fr] gap-2">
            <input value={vForm.emoji} onChange={(e) => setVForm({ ...vForm, emoji: e.target.value })} placeholder="⭐" className="border border-gray-300 rounded-lg px-2 py-2 text-center text-lg" />
            <input required value={vForm.name} onChange={(e) => setVForm({ ...vForm, name: e.target.value })} placeholder="Value name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <input value={vForm.description} onChange={(e) => setVForm({ ...vForm, description: e.target.value })} placeholder="Short description (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button type="submit" disabled={loading === "v"} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading === "v" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add value
          </button>
        </form>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Badges</h3>
        <div className="space-y-2 mb-4">
          {badges.map(b => (
            <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <div className="text-gray-900 font-medium">{b.emoji} {b.name}</div>
              <button onClick={() => deleteBadge(b.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {badges.length === 0 && <p className="text-sm text-gray-500">No badges yet.</p>}
        </div>
        <form onSubmit={addBadge} className="space-y-2 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-[60px_1fr] gap-2">
            <input value={bForm.emoji} onChange={(e) => setBForm({ ...bForm, emoji: e.target.value })} placeholder="🏆" className="border border-gray-300 rounded-lg px-2 py-2 text-center text-lg" />
            <input required value={bForm.name} onChange={(e) => setBForm({ ...bForm, name: e.target.value })} placeholder="Badge name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={loading === "b"} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading === "b" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add badge
          </button>
        </form>
      </div>
    </div>
  );
}
