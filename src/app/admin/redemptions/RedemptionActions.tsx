"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RedemptionActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");

  async function update(action: "fulfill" | "cancel", extras: any = {}) {
    setLoading(true);
    await fetch(`/api/admin/redemptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extras }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  if (status === "FULFILLED" || status === "CANCELLED" || status === "FAILED") {
    return <span className="text-xs text-gray-400">—</span>;
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value)}
          placeholder="Voucher code"
          className="w-24 border border-gray-300 rounded px-2 py-1 text-xs"
        />
        <button
          onClick={() => update("fulfill", { voucherCode })}
          disabled={loading || !voucherCode}
          className="text-xs text-green-700 hover:text-green-800 disabled:opacity-50"
        >
          ✓
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setEditing(true)} className="text-xs text-indigo-600 hover:text-indigo-800">Fulfill</button>
      <button onClick={() => update("cancel")} disabled={loading} className="text-xs text-red-600 hover:text-red-700">Cancel</button>
    </div>
  );
}
