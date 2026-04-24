"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function WorkspaceActions({ workspaceId, initialPlan, initialBudget }: { workspaceId: string; initialPlan: string; initialBudget: number }) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [budget, setBudget] = useState(initialBudget);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/sup-min/workspaces/${workspaceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, monthlyBudgetPoints: budget }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function resetBudget() {
    setLoading(true);
    await fetch(`/api/sup-min/workspaces/${workspaceId}/reset-budget`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select value={plan} onChange={(e) => setPlan(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white">
        <option value="free">Free</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
      </select>
      <input type="number" value={budget} onChange={(e) => setBudget(parseInt(e.target.value || "0"))} className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-xs" />
      <button onClick={save} disabled={loading} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
        {loading && <Loader2 className="w-3 h-3 animate-spin" />}Save
      </button>
      <button onClick={resetBudget} disabled={loading} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs border border-gray-300 hover:bg-gray-200">Reset monthly pts</button>
      {saved && <span className="text-xs text-green-700">✓</span>}
    </div>
  );
}
