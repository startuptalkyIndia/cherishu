"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Award } from "lucide-react";

const AWARDS = [
  "Employee of the Month",
  "Spot Award",
  "Rising Star",
  "Team Player of the Quarter",
  "Innovation Champion",
  "Customer Hero",
];

export default function NominateForm({ people }: { people: { id: string; name: string; jobTitle: string | null }[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ nomineeId: "", award: "Employee of the Month", reason: "", points: 500 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomineeId || !form.reason.trim()) { setErr("Please fill all fields"); return; }
    setLoading(true); setErr("");
    const res = await fetch("/api/nominations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error || "Failed");
    setSuccess(true);
    setForm({ nomineeId: "", award: "Employee of the Month", reason: "", points: 500 });
    setTimeout(() => setSuccess(false), 2500);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nominee</label>
        <select value={form.nomineeId} onChange={(e) => setForm({ ...form, nomineeId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Choose a teammate…</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}{p.jobTitle ? ` — ${p.jobTitle}` : ""}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Award</label>
        <select value={form.award} onChange={(e) => setForm({ ...form, award: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          {AWARDS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Why do they deserve it?</label>
        <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Be specific with examples..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Suggested points (optional)</label>
        <input type="number" min={0} value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value || "0") })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      {err && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{err}</div>}
      {success && <div className="bg-green-100 text-green-800 text-sm px-3 py-2 rounded-lg">Nomination submitted! HR will review it.</div>}
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />} Submit nomination
        </button>
      </div>
    </form>
  );
}
