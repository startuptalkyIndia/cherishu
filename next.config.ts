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
