"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, CheckCircle2, Circle, X, Sparkles, Loader2, Zap } from "lucide-react";

type Item = {
  key: string;
  label: string;
  description: string;
  done: boolean;
  href?: string;
  action?: "demo";
};

export default function GettingStarted({
  items,
  progress,
}: {
  items: Item[];
  progress: { done: number; total: number };
}) {
  const router = useRouter();
  const [dismissing, setDismissing] = useState(false);
  const [populating, setPopulating] = useState(false);
  const [populated, setPopulated] = useState<string>("");

  async function dismiss() {
    setDismissing(true);
    await fetch("/api/admin/workspace", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onboardingDismissed: true }) });
    router.refresh();
  }

  async function populateDemo() {
    if (!confirm("Add 6 demo teammates, 15 recognitions, and sample nominations to this workspace? You can delete demo users later from the Users page.")) return;
    setPopulating(true);
    const res = await fetch("/api/admin/demo-data", { method: "POST" });
    const data = await res.json();
    setPopulating(false);
    if (res.ok) {
      setPopulated(`Added ${data.usersAdded} users + ${data.kudos} kudos`);
      setTimeout(() => { setPopulated(""); router.refresh(); }, 2500);
    } else {
      alert(data.error || "Failed to populate");
    }
  }

  const pct = Math.round((progress.done / progress.total) * 100);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-5 text-white mb-6 relative overflow-hidden">
      <button onClick={dismiss} disabled={dismissing} className="absolute top-4 right-4 text-indigo-200 hover:text-white opacity-80" aria-label="Dismiss">
        {dismissing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Get started with Cherishu</h2>
      </div>
      <p className="text-sm text-indigo-100 mb-4">Finish these steps to unlock the full experience for your team.</p>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
          <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-medium whitespace-nowrap">{progress.done}/{progress.total} · {pct}%</span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {items.map((item) => (
          <ItemRow key={item.key} item={item} onDemo={populateDemo} loading={populating} />
        ))}
      </div>

      {populated && (
        <div className="bg-white/20 backdrop-blur text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" /> {populated}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, onDemo, loading }: { item: Item; onDemo: () => void; loading: boolean }) {
  const inner = (
    <>
      <div className="shrink-0 mt-0.5">
        {item.done ? <CheckCircle2 className="w-5 h-5 text-green-300" fill="currentColor" /> : <Circle className="w-5 h-5 text-white/50" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${item.done ? "text-white/70 line-through" : "text-white"}`}>{item.label}</div>
        <div className={`text-xs ${item.done ? "text-white/50" : "text-indigo-100"}`}>{item.description}</div>
      </div>
    </>
  );

  const className = `flex items-start gap-3 p-3 rounded-lg border transition ${item.done ? "bg-white/5 border-white/10" : "bg-white/10 hover:bg-white/15 border-white/20"}`;

  if (item.action === "demo" && !item.done) {
    return (
      <button onClick={onDemo} disabled={loading} className={`${className} text-left w-full disabled:opacity-60`}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin text-white mt-0.5" /> : <Zap className="w-5 h-5 text-yellow-300 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">{item.label}</div>
          <div className="text-xs text-indigo-100">{item.description}</div>
        </div>
      </button>
    );
  }

  if (item.href && !item.done) {
    return <Link href={item.href} className={className}>{inner}</Link>;
  }

  return <div className={className}>{inner}</div>;
}
