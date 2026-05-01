// next.config.ts — Cherishu
// Security headers + standard config from _shared/templates/config/next.config.ts.template

import type { NextConfig } from "next";

const securityHeaders = [
  // HSTS — force HTTPS for 2 years
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer privacy
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions-Policy — disable risky APIs by default
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Content-Security-Policy — restrict resource origins
  // NOTE: 'unsafe-inline' and 'unsafe-eval' are required for Next.js client-side rendering.
  // If you add a nonce-based CSP in the future, remove these directives.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.resend.com https://api.razorpay.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
