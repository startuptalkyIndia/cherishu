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

## [2026-04-26] Master Hub Broadcast Done (8-step follow-up)

- **Step 1** Pulled standardization commits: ✓ (Already up to date — earlier rebase pulled them)
- **Step 2** Seed verified, 3 standard users in DB: ✓
   - `PlatformAdmin`: `superadmin@cherishu.com` (verified via SQL)
   - `User HR_ADMIN`: `admin@cherishu.com` (verified via SQL)
   - `User EMPLOYEE`: `user@cherishu.com` (verified via SQL)
   - Seed ran cleanly against production DB. Idempotent (uses `upsert`), safe to re-run.
- **Step 3** Legal pages: ✓ `/privacy`, `/terms`, `/refund` shipped earlier in the day, footer linked.
- **Step 4** SEO foundation: ✓ `app/robots.ts`, `app/sitemap.ts`, OG + Twitter Card metadata in `app/layout.tsx`, Schema.org JSON-LD (Organization + SoftwareApplication + WebSite) on every page.
- **Step 5** Standard `package.json` scripts: ✓
   - Added: `db:reset`, `db:migrate`
   - Updated `db:seed` → `npx prisma db seed`, with `prisma.seed` → `tsx prisma/seed.ts` config so the standard CLI invocation works
- **Step 6** `/api/health` endpoint: ✓ Returns `{status, timestamp, db, latencyMs, service, version}`. 200 if DB reachable (queries `SELECT 1`), 503 if not. Cache-Control: no-store. Used by Docker healthcheck + uptime monitors.
- **Step 7** Pushed to main: ✓ (commits `9e3ff1b` + `634b5c4`)
- **Step 8** This update.

**NOT redeployed** per Master Hub instruction. The /api/health route + new package.json scripts will activate on the next coordinated deploy. The seed already ran on production so standard credentials are live in the DB right now.

## [2026-04-26] Master Hub Broadcast v2 Done

- **Step 0** Stashed local + pulled Master Hub commits: ✓ (no uncommitted work)
- **Step 1** Pull --rebase: ✓ (already up to date)
- **Step 2** Privacy/Terms/Refund customized for Cherishu: ✓ (done in v1, not generic)
- **Step 2** `/api/health` verified: ✓ (returns DB-pinged 200, 503 on failure)
- **Step 3** Seed verified, 3 standard users in DB: ✓ (`superadmin@cherishu.com`, `admin@cherishu.com`, `user@cherishu.com` — all live in production from earlier seed run)
- **Step 4** Footer + EmptyState + CookieConsent imported: ✓
   - Footer in `MarketingShell` (cross-links to Optimo/BillForge/SeizeLead)
   - EmptyState in `src/components/` with Cherishu-specific usage examples ready to wire
   - CookieConsent imported at root `app/layout.tsx` (GDPR + India DPDP)
- **Step 5** SEO foundation (robots/sitemap/OG/Schema): ✓ (done in v1)
- **Step 6** Standard scripts: ✓ (done in v1, including `prisma.seed` config)
- **Step 7** CI/Dependabot/PR template added: **PARTIAL**
   - PR template ✓ committed
   - Dependabot config ✓ committed
   - `ci.yml` + `security-scan.yml` written locally but **NOT pushed** — current OAuth token lacks `workflow` scope. Need to run `gh auth refresh -h github.com -s workflow` (interactive browser flow) to unlock, then push the two workflow files.
- **Step 8** Sentry: **N/A** (Cherishu is not on the Tier 1+2 list per broadcast — Tier 1+2 = SeizeLead, Optimo, BillForge, Mailpulse, OutreachIQ, PayDesk, HireTrack, TalkyHub, mailprobe, BusinessVoyage)
- **Step 9** CHANGELOG.md created: ✓ (Keep-a-Changelog format with full release history reconstructed from git, 0.1.0 → 0.5.0)
- **Step 10** Pushed to main: ✓ (commits `cc366d4`-base → `87fe839`)
- **Step 11** This update.

**NOT redeployed** per Master Hub instruction. Server stays on previous build until coordinated deploy.

### Standard Footer (added earlier same day)

- Copied `_shared/templates/components/Footer.tsx.template` → `src/components/Footer.tsx`
- Replaced `{{PROJECT_NAME}}` → "Cherishu", `{{COMPANY}}` → "TalkyTools"
- Imported in `MarketingShell.tsx` (replaces inline footer)
- 4-column layout: Brand · Product · Legal · TalkyTools Family (cross-links to Optimo, BillForge, SeizeLead per template)
- Build verified, no regressions
- Commit `8dfde31`

## Earlier broadcasts (already absorbed)

- 2026-04-24: Cherishu launched with full feature set (R&R core, marketplace, billing, manager console, audit log, public pages, lead capture). See `git log` for full history.
