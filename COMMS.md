# Cherishu — Master Hub Comms

## [2026-04-26] Master Hub broadcast — TalkyTools platform standards

Done: A, B, C, D, E.
Pending: (none on this broadcast — F is this update itself.)

### Detail

**A) `git pull`** ✓ Already up to date on `main`.

**B) Standard credentials** ✓ Updated `prisma/seed.ts`.
   - Super Admin: `superadmin@cherishu.com` / `Shu_bham12!` (PlatformAdmin → /sup-min)
   - Admin: `admin@cherishu.com` / `Admin@2026!` (User HR_ADMIN → /login)
   - Demo User: `user@cherishu.com` / `User@2026!` (User EMPLOYEE → /login)
   - Plus 5 demo teammates and 15 platform-wide rewards (idempotent — only seeds first time).
   - `docker-compose.yml`: changed `restart: unless-stopped` → `restart: always` on both services per broadcast wording.

**C) Legal pages** ✓ Added 3 routes:
   - `/privacy` — Cherishu-specific privacy policy (data collected, where stored, who shared with, GDPR rights).
   - `/terms` — Pro plan terms, acceptable use, liability cap, India jurisdiction.
   - `/refund` — Free trial → no refund needed; Pro 7-day pro-rata refund clause; reward auto-refund on provider failure; marketplace dispute routing.
   - Footer of `MarketingShell` now links to all three.

**D) SEO foundation** ✓
   - `app/robots.ts` — allows all public pages, disallows `/admin`, `/sup-min`, `/dashboard`, `/api`. Points to sitemap.
   - `app/sitemap.ts` — 11 static URLs (landing, features, pricing, security, faq, contact, privacy, terms, refund, login, signup) with priority + changeFrequency.
   - `app/layout.tsx` — full Open Graph + Twitter Card metadata, `metadataBase`, canonical, robots index/follow, keywords, og-image (1200×630).
   - JSON-LD: Organization + SoftwareApplication (with Free + Pro Offer pricing) + WebSite — all in a single `@graph` block in `<head>`.
   - Note: `/og-image.png` placeholder needed in `public/` — currently will 404 until image is added.
   - Sitemap will list dynamic URLs once we add a public blog or merchant directory; for now the 11 static pages cover the marketing surface.

**E) `CREDENTIALS.md`** ✓ Rewrote to match standard pattern + added server / cron / production secrets reference.

**F) This file (COMMS.md)** ✓ This is the report.

**G) NOT redeployed yet** per Master Hub instruction. The compose change + standard seed + legal pages + SEO files will activate on next coordinated deploy.

## Open follow-ups

- After deploy: re-run `prisma db seed` on server to refresh production users with the standard passwords (the existing super admin email was `superadmin@cherishu.com` so the email key matches — passwords will simply be reset by `upsert`).
- Add a real `public/og-image.png` (1200×630, brand-aligned) before submitting the site to Google Search Console.
- Consider adding `app/blog/` programmatic SEO once content is ready (Master Hub broadcast 04 mentioned this as the bonus).

## Earlier broadcasts (already absorbed)

- 2026-04-24: Cherishu launched with full feature set (R&R core, marketplace, billing, manager console, audit log, public pages, lead capture). See `git log` for full history.
