"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Cake, PartyPopper, Mail, MessageSquare, Send } from "lucide-react";

export default function SettingsForm({ workspace, values, badges }: { workspace: any; values: any[]; badges: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: workspace.name,
    monthlyBudgetPoints: workspace.monthlyBudgetPoints,
    currency: workspace.currency,
  });
  const [auto, setAuto] = useState({
    autoBirthdayEnabled: workspace.autoBirthdayEnabled,
    autoBirthdayPoints: workspace.autoBirthdayPoints,
    autoBirthdayMessage: workspace.autoBirthdayMessage,
    autoAnniversaryEnabled: workspace.autoAnniversaryEnabled,
    autoAnniversaryPoints: workspace.autoAnniversaryPoints,
    autoAnniversaryMessage: workspace.autoAnniversaryMessage,
  });
  const [emails, setEmails] = useState({
    emailOnKudos: workspace.emailOnKudos,
    emailOnRedemption: workspace.emailOnRedemption,
    emailOnNomination: workspace.emailOnNomination,
    emailOnWelcome: workspace.emailOnWelcome,
    emailWeeklyDigest: workspace.emailWeeklyDigest,
  });
  const [chat, setChat] = useState({
    chatWebhookType: workspace.chatWebhookType || "slack",
    chatWebhookUrl: workspace.chatWebhookUrl || "",
    chatChannelLabel: workspace.chatChannelLabel || "",
    chatOnKudos: workspace.chatOnKudos,
    chatOnAutoKudos: workspace.chatOnAutoKudos,
    chatOnNominationAwarded: workspace.chatOnNominationAwarded,
  });
  const [chatTestResult, setChatTestResult] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState("");

  async function saveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setLoading("w");
    await fetch("/api/admin/workspace", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(""); setSaved("w");
    setTimeout(() => setSaved(""), 2000);
    router.refresh();
  }

  async function saveAuto(e: React.FormEvent) {
    e.preventDefault();
    setLoading("a");
    await fetch("/api/admin/workspace", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(auto) });
    setLoading(""); setSaved("a");
    setTimeout(() => setSaved(""), 2000);
    router.refresh();
  }

  async function saveEmails(e: React.FormEvent) {
    e.preventDefault();
    setLoading("e");
    await fetch("/api/admin/workspace", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(emails) });
    setLoading(""); setSaved("e");
    setTimeout(() => setSaved(""), 2000);
    router.refresh();
  }

  async function saveChat(e: React.FormEvent) {
    e.preventDefault();
    setLoading("c");
    await fetch("/api/admin/workspace", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(chat) });
    setLoading(""); setSaved("c");
    setTimeout(() => setSaved(""), 2000);
    router.refresh();
  }

  async function testChat() {
    setLoading("tc"); setChatTestResult("");
    const res = await fetch("/api/admin/chat-webhook/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: chat.chatWebhookType, url: chat.chatWebhookUrl }) });
    const data = await res.json();
    setLoading("");
    setChatTestResult(res.ok ? (data.ok ? "Posted ✓ Check your chat channel" : `Failed: ${data.error || "unknown"}`) : `Error: ${data.error || "failed"}`);
  }

  async function testRun() {
    setLoading("t");
    const res = await fetch("/api/admin/auto-kudos/test-run", { method: "POST" });
    const data = await res.json();
    setLoading("");
    alert(`Test run complete: ${data.birthdayCount || 0} birthday + ${data.anniversaryCount || 0} anniversary kudos posted.`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Company basics */}
      <form onSubmit={saveWorkspace} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
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
          {saved === "w" && <span className="text-sm text-green-700">Saved ✓</span>}
          <button type="submit" disabled={loading === "w"} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {loading === "w" && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
          </button>
        </div>
      </form>

      {/* Auto-kudos */}
      <form onSubmit={saveAuto} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Automatic Kudos</h2>
          <p className="text-xs text-gray-500 mt-0.5">Cherishu automatically posts celebration kudos on birthdays and work anniversaries. Placeholders: <code className="bg-gray-100 px-1 rounded">{"{name}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{years}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{s}"}</code> (plural).</p>
        </div>

        {/* Birthday block */}
        <div className="border border-pink-200 bg-pink-50 rounded-lg p-4">
          <label className="flex items-center gap-2 font-medium text-gray-900">
            <Cake className="w-5 h-5 text-pink-600" />
            <input type="checkbox" checked={auto.autoBirthdayEnabled} onChange={(e) => setAuto({ ...auto, autoBirthdayEnabled: e.target.checked })} />
            Auto-post birthday kudos
          </label>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Award points</label>
              <input type="number" min={0} value={auto.autoBirthdayPoints} onChange={(e) => setAuto({ ...auto, autoBirthdayPoints: parseInt(e.target.value || "0") })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" disabled={!auto.autoBirthdayEnabled} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Message template</label>
              <textarea rows={2} value={auto.autoBirthdayMessage} onChange={(e) => setAuto({ ...auto, autoBirthdayMessage: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" disabled={!auto.autoBirthdayEnabled} />
            </div>
          </div>
        </div>

        {/* Anniversary block */}
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
          <label className="flex items-center gap-2 font-medium text-gray-900">
            <PartyPopper className="w-5 h-5 text-yellow-600" />
            <input type="checkbox" checked={auto.autoAnniversaryEnabled} onChange={(e) => setAuto({ ...auto, autoAnniversaryEnabled: e.target.checked })} />
            Auto-post work anniversary kudos
          </label>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Award points</label>
              <input type="number" min={0} value={auto.autoAnniversaryPoints} onChange={(e) => setAuto({ ...auto, autoAnniversaryPoints: parseInt(e.target.value || "0") })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" disabled={!auto.autoAnniversaryEnabled} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Message template</label>
              <textarea rows={2} value={auto.autoAnniversaryMessage} onChange={(e) => setAuto({ ...auto, autoAnniversaryMessage: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" disabled={!auto.autoAnniversaryEnabled} />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-3">
          <button type="button" onClick={testRun} disabled={loading === "t"} className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2">
            {loading === "t" && <Loader2 className="w-4 h-4 animate-spin" />} Run now (for today)
          </button>
          <div className="flex items-center gap-3">
            {saved === "a" && <span className="text-sm text-green-700">Saved ✓</span>}
            <button type="submit" disabled={loading === "a"} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {loading === "a" && <Loader2 className="w-4 h-4 animate-spin" />} Save auto-kudos
            </button>
          </div>
        </div>
      </form>

      {/* Email notifications */}
      <form onSubmit={saveEmails} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Mail className="w-5 h-5 text-indigo-600" /> Email Notifications</h2>
          <p className="text-xs text-gray-500 mt-0.5">Toggle which emails Cherishu sends for this workspace. (Platform email provider is set by the super admin.)</p>
        </div>
        <div className="space-y-2">
          {[
            { key: "emailOnWelcome", label: "Welcome email when a user is added" },
            { key: "emailOnKudos", label: "\"You received a kudos\" to recipient" },
            { key: "emailOnRedemption", label: "Redemption fulfilled notification" },
            { key: "emailOnNomination", label: "New nomination alert to HR admins" },
            { key: "emailWeeklyDigest", label: "Weekly engagement digest to HR admins (Mondays)" },
          ].map((row) => (
            <label key={row.key} className="flex items-center gap-3 text-sm text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={(emails as any)[row.key]} onChange={(e) => setEmails({ ...emails, [row.key]: e.target.checked })} />
              {row.label}
            </label>
          ))}
        </div>
        <div className="flex justify-end items-center gap-3">
          {saved === "e" && <span className="text-sm text-green-700">Saved ✓</span>}
          <button type="submit" disabled={loading === "e"} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {loading === "e" && <Loader2 className="w-4 h-4 animate-spin" />} Save email prefs
          </button>
        </div>
      </form>

      {/* Chat webhook */}
      <form onSubmit={saveChat} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-600" /> Slack / Teams / Discord</h2>
          <p className="text-xs text-gray-500 mt-0.5">Post kudos and celebrations automatically to your chat tool. Paste an incoming webhook URL from your Slack, Teams, or Discord workspace.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Platform</label>
            <select value={chat.chatWebhookType} onChange={(e) => setChat({ ...chat, chatWebhookType: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="slack">Slack</option>
              <option value="teams">MS Teams</option>
              <option value="discord">Discord</option>
              <option value="generic">Generic webhook</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Webhook URL</label>
            <input type="url" value={chat.chatWebhookUrl} onChange={(e) => setChat({ ...chat, chatWebhookUrl: e.target.value })} placeholder="https://hooks.slack.com/services/..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Channel label (display only)</label>
          <input value={chat.chatChannelLabel} onChange={(e) => setChat({ ...chat, chatChannelLabel: e.target.value })} placeholder="#recognition" className="w-full sm:w-60 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1 pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 pt-2">Post which events?</p>
          {[
            { key: "chatOnKudos", label: "Peer kudos (recognitions)" },
            { key: "chatOnAutoKudos", label: "Auto-kudos (birthdays + work anniversaries)" },
            { key: "chatOnNominationAwarded", label: "Nomination awarded by HR" },
          ].map((row) => (
            <label key={row.key} className="flex items-center gap-3 text-sm text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={(chat as any)[row.key]} onChange={(e) => setChat({ ...chat, [row.key]: e.target.checked })} />
              {row.label}
            </label>
          ))}
        </div>

        <div className="flex justify-between items-center gap-3">
          <button type="button" onClick={testChat} disabled={loading === "tc" || !chat.chatWebhookUrl} className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2">
            {loading === "tc" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send test
          </button>
          <div className="flex items-center gap-3">
            {saved === "c" && <span className="text-sm text-green-700">Saved ✓</span>}
            <button type="submit" disabled={loading === "c"} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {loading === "c" && <Loader2 className="w-4 h-4 animate-spin" />} Save chat integration
            </button>
          </div>
        </div>
        {chatTestResult && <div className={`text-sm px-3 py-2 rounded-lg ${chatTestResult.startsWith("Posted") ? "bg-green-100 text-green-800" : "bg-red-50 text-red-600"}`}>{chatTestResult}</div>}
      </form>

      {/* Values + Badges summary */}
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
