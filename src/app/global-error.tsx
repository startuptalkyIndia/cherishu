"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // A tab left open across a deploy still holds the old build's Server Action ids; the new server rejects them.
  // That is a stale client, not an app bug: reload once to pick up the current build.
  useEffect(() => {
    if (
      error.message?.includes("Failed to find Server Action") ||
      error.message?.includes("Server Reference ID did not match")
    ) {
      const KEY = "__stale_action_reload";
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
      }
    }
  }, [error]);

  // Inline styles on purpose: this component replaces the root layout, so global CSS is not loaded here.
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Cherishu hit a snag</h1>
            <p style={{ color: "#6b7280", margin: "0 0 24px" }}>
              Something unexpected happened.
              {error.digest && <span style={{ display: "block", fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Error ID: {error.digest}</span>}
            </p>
            <button onClick={reset} style={{ padding: "12px 24px", background: "#4f46e5", color: "#fff", border: 0, borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
