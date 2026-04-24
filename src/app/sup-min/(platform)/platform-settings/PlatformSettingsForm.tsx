"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Send } from "lucide-react";

export default function PlatformSettingsForm({ apiKey: initApiKey, from: initFrom, baseUrl: initBaseUrl }: { apiKey: string; from: string; baseUrl: string }) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState(initApiKey);
  const [from, setFrom] = useState(initFrom);
  const [baseUrl, setBaseUrl] = useState(initBaseUrl);
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState("");
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState("");

  async function save() {
    setLoading("s");
    await fetch("/api/sup-min/platform-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resend_api_key: apiKey, email_from: from, email_base_url: baseUrl }),
    });
    setLoading("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function testSend() {
    if (!testEmail) return;
    setLoading("t"); setTestResult("");
    const res = await fetch("/api/sup-min/platform-settings/test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: testEmail }),
    });
    const data = await res.json();
    setLoading("");
    setTestResult(res.ok ? (data.skipped ? "Skipped (no API key configured)" : `Sent ✓ id=${data.id || "ok"}`) : `Error: ${data.error || "failed"}`);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Mail className="w-5 h-5 text-indigo-600" /> Email (Resend)</h2>
        <p className="text-xs text-gray-500">Configure once. Applies to all workspaces on the platform. Get a free Resend key at <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">resend.com</a>.</p>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Resend API key</label>
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="re_xxxxxxxxxxxxxxxxx" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From address</label>
          <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Cherishu <hello@cherishu.talkytools.com>" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <p className="text-xs text-gray-500 mt-1">Domain must be verified in Resend. Fallback: <code>onboarding@resend.dev</code> (Resend default).</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Base URL for email links</label>
          <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://cherishu.talkytools.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="flex justify-end items-center gap-3">
          {saved && <span className="text-sm text-green-700">Saved ✓</span>}
          <button onClick={save} disabled={loading === "s"} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {loading === "s" && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h3 className="font-semibold text-gray-900">Send test email</h3>
        <div className="flex gap-2">
          <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={testSend} disabled={loading === "t" || !testEmail} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {loading === "t" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Test send
          </button>
        </div>
        {testResult && <div className={`text-sm px-3 py-2 rounded-lg ${testResult.startsWith("Sent") ? "bg-green-100 text-green-800" : testResult.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-700"}`}>{testResult}</div>}
      </div>
    </div>
  );
}
