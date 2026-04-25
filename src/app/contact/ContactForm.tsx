"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "10-50",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        source: typeof window !== "undefined" ? window.location.pathname : "/contact",
        utmSource: sp.get("utm_source"),
        utmMedium: sp.get("utm_medium"),
        utmCampaign: sp.get("utm_campaign"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Submission failed. Try emailing us directly.");
    }
    setSuccess(true);
    setForm({ name: "", email: "", company: "", teamSize: "10-50", message: "" });
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Got it — thanks!</h2>
        <p className="mt-2 text-sm text-gray-600">A real person will reply within one business day. If it&apos;s urgent, email <a href="mailto:sales@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800 font-medium">sales@cherishu.talkytools.com</a> directly.</p>
        <button onClick={() => setSuccess(false)} className="mt-6 text-sm text-indigo-600 hover:text-indigo-800 font-medium">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Send us a message</h2>
      <p className="text-xs text-gray-500 mb-3">All fields except company are required.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Work email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
      </div>
      <Field label="Company name (optional)" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Team size</label>
        <select value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="<10">Less than 10</option>
          <option value="10-50">10–50</option>
          <option value="50-200">50–200</option>
          <option value="200-1000">200–1,000</option>
          <option value="1000+">1,000+</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">What can we help with?</label>
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="A demo, security paperwork, custom pricing for 500+ users, integration question…"
        />
      </div>
      {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />} Send message
      </button>
      <p className="text-xs text-gray-500 text-center">By sending, you agree to our standard data handling — see <a href="/security" className="text-indigo-600 hover:text-indigo-800">Security</a>.</p>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}
