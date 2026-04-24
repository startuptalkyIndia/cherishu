"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Loader2, Star, X } from "lucide-react";
import { REWARD_TYPE_META } from "@/lib/reward-providers";

type Reward = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  type: string;
  pointsCost: number;
  currencyValue: number | null;
  currency: string;
  category: string | null;
  featured: boolean;
};

export default function RewardsGrid({ rewards, redeemable }: { rewards: Reward[]; redeemable: number }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function redeem() {
    if (!selected) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/redemptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardId: selected.id }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Redemption failed");
    setSuccess(data.voucherCode ? `Redeemed! Voucher: ${data.voucherCode}` : "Redemption submitted! Check My Redemptions for updates.");
    setTimeout(() => {
      setSelected(null);
      setSuccess("");
      router.refresh();
    }, 2500);
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <p className="text-sm text-gray-500">No rewards available in this category yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rewards.map((r) => {
          const meta = REWARD_TYPE_META[r.type];
          const canAfford = redeemable >= r.pointsCost;
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md text-left transition"
            >
              <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-5xl relative">
                {r.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{meta?.emoji || "🎁"}</span>
                )}
                {r.featured && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3" fill="currentColor" /> Featured
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-0.5">{meta?.label || r.type}</div>
                <div className="font-semibold text-gray-900 line-clamp-1">{r.name}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                    <Coins className="w-3.5 h-3.5" /> {r.pointsCost.toLocaleString()}
                  </span>
                  {!canAfford && <span className="text-xs text-gray-400">Need more pts</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => !loading && setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <div className="text-5xl mb-3">{REWARD_TYPE_META[selected.type]?.emoji || "🎁"}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{REWARD_TYPE_META[selected.type]?.label}</div>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{selected.name}</h3>
            {selected.description && <p className="text-sm text-gray-600 mt-2">{selected.description}</p>}
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-indigo-700 font-medium">Cost</div>
                <div className="text-lg font-bold text-indigo-700 flex items-center gap-1">
                  <Coins className="w-4 h-4" /> {selected.pointsCost.toLocaleString()} pts
                </div>
              </div>
              {selected.currencyValue && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Value</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selected.currency === "INR" ? "₹" : selected.currency} {selected.currencyValue}
                  </div>
                </div>
              )}
            </div>

            {error && <div className="mt-3 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
            {success && <div className="mt-3 bg-green-100 text-green-800 text-sm px-3 py-2 rounded-lg">{success}</div>}

            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => setSelected(null)} disabled={loading} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 border border-gray-300">
                Cancel
              </button>
              <button
                onClick={redeem}
                disabled={loading || redeemable < selected.pointsCost || !!success}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {redeemable < selected.pointsCost ? "Not enough points" : "Redeem now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
