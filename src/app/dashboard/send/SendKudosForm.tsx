"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Sparkles } from "lucide-react";

type Person = { id: string; name: string; email: string; jobTitle: string | null };
type Badge = { id: string; name: string; emoji: string };
type Value = { id: string; name: string; emoji: string };

const TEMPLATES = [
  { label: "🙏 Thank you", text: "Huge thanks for [what they did] — it really made a difference. You're a star!" },
  { label: "🚀 Above & beyond", text: "You went above and beyond on [project]. The way you [specific action] saved the day. Genuinely impressed." },
  { label: "💡 Brilliant idea", text: "Your idea about [topic] was exactly what we needed. Smart, creative, and it actually works. 👏" },
  { label: "🤝 Team player", text: "Stepped in when we needed it most. The team appreciates the support — couldn't have shipped without you." },
  { label: "🏆 Customer hero", text: "The way you handled [customer/situation] turned a tough moment into a win. That's how we earn trust." },
  { label: "📣 Owned it", text: "You took complete ownership of [thing] and drove it to the finish line. No drama, just results." },
  { label: "🎯 Crushed the goal", text: "Hitting [milestone] is a big deal — and you made it look easy. Hat tip from the whole team." },
  { label: "🌟 Mentor moment", text: "Thanks for taking the time to mentor [person/team]. Sharing what you know lifts everyone up." },
];

export default function SendKudosForm({ people, badges, values, giveablePoints, defaultReceiver }: {
  people: Person[]; badges: Badge[]; values: Value[]; giveablePoints: number; defaultReceiver?: string;
}) {
  const router = useRouter();
  const [receiverId, setReceiverId] = useState(defaultReceiver || "");
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(50);
  const [badgeId, setBadgeId] = useState("");
  const [valueId, setValueId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!receiverId) return setError("Pick someone to recognize");
    if (!message.trim()) return setError("Write a quick message");
    if (points > giveablePoints) return setError(`You only have ${giveablePoints} points to give`);

    setLoading(true);
    const res = await fetch("/api/recognitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId, message, points, badgeId: badgeId || null, valueId: valueId || null }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Failed to send");
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Recipient</label>
        <select
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Choose a teammate…</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.jobTitle ? `— ${p.jobTitle}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500">Message</label>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Quick templates</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setMessage(t.text)}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"
              title={t.text}
            >
              {t.label}
            </button>
          ))}
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="What did they do that was amazing? Tap a template above to start."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Points ({giveablePoints} available)</label>
          <input
            type="number"
            min={0}
            max={giveablePoints}
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value || "0"))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Badge (optional)</label>
          <select
            value={badgeId}
            onChange={(e) => setBadgeId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">None</option>
            {badges.map((b) => (
              <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Company Value (optional)</label>
          <select
            value={valueId}
            onChange={(e) => setValueId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">None</option>
            {values.map((v) => (
              <option key={v.id} value={v.id}>{v.emoji} {v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send Kudos
        </button>
      </div>
    </form>
  );
}
