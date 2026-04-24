"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

type Person = { id: string; name: string; email: string; jobTitle: string | null };
type Badge = { id: string; name: string; emoji: string };
type Value = { id: string; name: string; emoji: string };

export default function SendKudosForm({ people, badges, values, giveablePoints }: {
  people: Person[]; badges: Badge[]; values: Value[]; giveablePoints: number;
}) {
  const router = useRouter();
  const [receiverId, setReceiverId] = useState("");
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
        <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="What did they do that was amazing?"
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
