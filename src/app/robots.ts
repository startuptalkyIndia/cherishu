import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/sup-min", "/dashboard", "/api"] },
    ],
    sitemap: "https://cherishu.talkytools.com/sitemap.xml",
    host: "https://cherishu.talkytools.com",
  };
}
