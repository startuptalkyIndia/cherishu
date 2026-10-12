// Source: _shared/templates/components/FeedbackWidget.tsx
// Do not edit per-project — edit here and re-propagate.
//
// Floating feedback widget — appears bottom-right on every page.
// 3-tap interaction: emoji rating + optional message + send.
// Data flows to /api/feedback (each project implements that route).
//
// Usage:
//   import { FeedbackWidget } from "@/components/shared/FeedbackWidget";
//   // In app/layout.tsx (after CookieConsent):
//   <FeedbackWidget productName="BillForge" />

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";

type Rating = "happy" | "neutral" | "sad";

interface FeedbackWidgetProps {
  productName: string;
  /** Where to POST the feedback. Defaults to /api/feedback. */
  endpoint?: string;
  /** Hide on certain paths (e.g. login, /sup-min) */
  hideOnPaths?: string[];
}

export function FeedbackWidget({
  productName,
  endpoint = "/api/feedback",
  hideOnPaths = ["/login", "/signup", "/sup-min"],
}: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<Rating | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  // Hide on private/auth paths (usePathname is SSR-safe: no hydration mismatch)
  const pathname = usePathname();
  if (hideOnPaths.some((p) => pathname === p || pathname?.startsWith(p + "/"))) {
    return null;
  }

  const submit = async () => {
    if (!rating) return;
    setSubmitting(true);
    setFailed(false);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          message: message.trim(),
          path: typeof window !== "undefined" ? window.location.pathname : "",
          product: productName,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
      });
      if (!res.ok) throw new Error(`feedback failed: ${res.status}`);
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setRating(null);
        setMessage("");
      }, 1800);
    } catch {
      // Failure must be loud: keep the form open with the text so nothing the
      // user typed is lost, and tell them it did not send (never fake "sent").
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
        aria-label={`Send feedback about ${productName}`}
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Feedback form"
      className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-2xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">How's {productName}?</h3>
          <p className="text-xs text-slate-500">Direct line to the team — we read every one.</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-700"
          aria-label="Close feedback"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {sent ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🙏</div>
          <div className="text-sm font-medium text-slate-900">Thanks — we got it.</div>
        </div>
      ) : (
        <>
          <div className="flex justify-around mb-3" role="radiogroup" aria-label="Rate your experience">
            {(["sad", "neutral", "happy"] as const).map((r) => (
              <button
                key={r}
                role="radio"
                aria-checked={rating === r}
                aria-label={r}
                onClick={() => setRating(r)}
                className={`text-3xl transition-transform hover:scale-125 ${
                  rating === r ? "scale-125" : "opacity-50"
                }`}
              >
                {r === "sad" ? "☹️" : r === "neutral" ? "😐" : "😊"}
              </button>
            ))}
          </div>

          {rating && (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  rating === "sad"
                    ? "What broke? (optional)"
                    : rating === "neutral"
                    ? "What could be better? (optional)"
                    : "What did you like? (optional)"
                }
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                maxLength={500}
              />
              <button
                onClick={submit}
                disabled={submitting}
                className="w-full bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {submitting ? "Sending..." : "Send"}
              </button>
              {failed && (
                <p role="alert" className="mt-2 text-xs text-red-600">
                  Couldn&apos;t send that. Please try again in a moment.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default FeedbackWidget;
