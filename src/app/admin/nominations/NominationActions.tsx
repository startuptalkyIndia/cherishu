"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

export default function NominationActions({ id, suggestedPoints }: { id: string; suggestedPoints: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [points, setPoints] = useState(suggestedPoints);
  const [showApprove, setShowApprove] = useState(false);

  async function decide(action: "approve" | "reject") {
    setLoading(action);
    const res = await fetch(`/api/admin/nominations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, points: action === "approve" ? points : undefined }),
    });
    setLoading("");
    if (res.ok) {
      setShowApprove(false);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed");
    }
  }

  if (showApprove) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value || "0"))}
          className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          placeholder="Points"
        />
        <button
          onClick={() => decide("approve")}
          disabled={loading === "approve"}
          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
        >
          {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Confirm award
        </button>
        <button onClick={() => setShowApprove(false)} className="text-xs text-gray-500 hover:text-gray-900">Cancel</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowApprove(true)}
        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 flex items-center gap-1"
      >
        <Check className="w-3 h-3" /> Award
      </button>
      <button
        onClick={() => decide("reject")}
        disabled={loading === "reject"}
        className="bg-white border border-gray-300 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50 flex items-center gap-1"
      >
        {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Reject
      </button>
    </div>
  );
}
