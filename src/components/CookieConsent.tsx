// Standard TalkyTools cookie consent banner — required for EU GDPR + India DPDP Act compliance.
// Source: _shared/templates/components/CookieConsent.tsx.template (placeholder replaced)

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "tt-cookie-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, ts: Date.now() }));
    setShow(false);
    // Fire any analytics setup here, e.g.:
    // window.gtag?.("consent", "update", { analytics_storage: "granted" })
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, ts: Date.now() }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4"
    >
      <div className="text-sm text-gray-700 mb-3">
        We use cookies for login, analytics, and to improve Cherishu. See our{" "}
        <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={reject}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded"
        >
          Reject
        </button>
        <button
          onClick={accept}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export default CookieConsent;
