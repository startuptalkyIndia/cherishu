import type { MetadataRoute } from "next";

const BASE = "https://cherishu.talkytools.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,         lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`,  lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/security`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/faq`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`,  lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/refund`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/login`,    lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/signup`,   lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
  ];
}
