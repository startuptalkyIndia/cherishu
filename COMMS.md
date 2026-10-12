# Cherishu — Master Hub Comms

## 2026-10-12 IST — fix: soft-delete review findings (billing/dashboard/analytics counts, restore route)
- **Review (talkytools-code-review) on 2443e08: FIX.** Billing MRR/trial/list and dashboard/analytics counts still counted deleted workspaces; no way to undo a workspace delete.
- **Done:** those queries now filter `workspace.deletedAt: null`; new `POST /api/sup-min/workspaces/[id]/restore` (platform admin) clears deletedAt. Emails of a deleted workspace's users stay reserved until restored (restore is the answer to 'email exists').
- **Open decision (founder):** deleting a paying workspace does NOT cancel its Razorpay subscription; cancel it by hand before deleting.
- **Verify:** tsc 0 errors. Deploy: run the 4 ALTER TABLE statements from the 2443e08 entry after a pg_dump, before the new image.

## 2026-10-12 IST — feat: soft delete for Workspace, Reward, Badge, CompanyValue

**What:** the four dangerous hard deletes now set `deletedAt = now()` instead of removing rows. Super-admin workspace delete used to cascade-wipe a company's users, kudos, redemptions (irreversible); admin reward/badge/value deletes and the super-admin reward delete were hard deletes too. **Why:** DB_STANDARD / HOW_WE_BUILD (soft delete, additive only, make deletes reversible). **Done when:** nullable `deletedAt` on the 4 models, delete routes only stamp it, every read path filters `deletedAt: null`, a deleted workspace cannot log in or appear anywhere. **Out of scope:** a restore UI (restore = `UPDATE ... SET "deletedAt" = NULL`), other models, hard purge job, changes to unrelated behaviour. **Verify:** `tsc` 0, `next build` ok, `tests/soft-delete/e2e.sh` against throwaway Postgres + built app (27/27).
**Schema (additive, project uses `prisma db push`, no migrations folder) - DEPLOY AGENT: apply BEFORE the container restart (B.18), after a `pg_dump`:**
```sql
ALTER TABLE "Workspace"    ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Reward"       ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Badge"        ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "CompanyValue" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
```
(Equivalent to `prisma db push` with the new schema; no drops, no renames, no index changes.) The new code reads `deletedAt`, so the old container + new columns is safe, new container + old schema is NOT.
**Behaviour notes:** (1) login (`lib/auth.ts`) and `getSessionUser` (`lib/session.ts`) refuse users of a soft-deleted workspace, so existing sessions are locked out on their next request too; (2) re-creating a value/badge with the name of a soft-deleted one restores that row (the `(workspaceId, name)` unique slot is still held); (3) kudos with a deleted/foreign badge or value now returns 400; (4) weekly digest and auto-kudos cron skip deleted workspaces; (5) deleting a reward also sets `isActive=false`.
**Deliberately NOT filtered (history must stay readable):** `include: { reward | badge | value }` on past redemptions/recognitions (profile, feed, exports, merchant redemption history, admin analytics name lookup) so old records still show their reward/badge name; `workspace.findUnique({ where: { slug } })` in signup and sup-min create (slug stays unique, a deleted slug is not reused); `reward-providers.ts` fulfilment of an already-placed redemption. Soft-deleted workspaces' users still hold their emails (signup with that email says "already registered"); users of a deleted workspace are excluded from the sup-min user count.
**Verified locally (throwaway Postgres 16 in docker, built app):** admin delete value/badge/reward returns 200, rows kept with `deletedAt` set, gone from admin pages, send page, rewards catalog; redeeming a deleted reward 404; kudos with deleted badge 400; super-admin delete workspace 200, workspace + 7 users + kudos still in DB, gone from sup-min list, detail 404, existing admin session redirected, fresh login rejected.

---

## 2026-10-12 IST — feat: feedback widget (benchmark parity item)

**What/why:** parity gap (every live product gets the feedback widget). **Change:** shared `FeedbackWidget` (hidden on /login, /signup, /sup-min), `POST /api/feedback` (hand-validated, 5/min per X-Real-IP with a swept map, 5 KB cap, 500 on DB failure), additive Prisma model `Feedback` (table `"Feedback"`, index `Feedback_createdAt_idx`), widget mounted in the root layout after CookieConsent. **Out of scope:** cron schedule, payments, email provider.
**Verified locally:** `tsc` 0 errors, `next build` ok; built app: bad rating 400, 6 KB body 413, DB down 500, 6th post from one IP 429; widget on / /pricing /privacy, absent on /login and /sup-min.
**DEPLOYED 2026-10-12 ~17:51 IST** as 313b750 (rollback ae75d3f) via `safe-deploy.sh cherishu 3045`, exit 0, after `pg_dump` (4.8 KB) to `/home/ubuntu/backups/cherishu/pre-feedback-20261012.sql.gz` and a hand-made `"Feedback"` table + index. **Evidence:** container Created 12:20:48 UTC healthy, restart policy `unless-stopped` on app and db, `/`, `/pricing`, `/login`, `/api/health`, `/sup-min` 200, widget on `/` and absent on `/login`, bad payload 400, one real POST saved (test row deleted, table back to 0), PlatformAdmin row still 1.
**INCIDENT (my miss):** the 16:46 IST relaunch left `cherishu` in `ARCHIVED=(...)` of `/home/ubuntu/scripts/enforce-archived-stopped.sh`; its */30 cron stopped cherishu-app and cherishu-db at 17:00 IST and pinned restart=no. Site was 502 until ~17:46 IST (found while preparing this deploy; a clean stop, no data lost). Fixed: prefix removed from the list (backup `.bak-cherishu`), restart policy restored, containers started. Lesson added to `_shared/LEARNINGS.md`.

---

## 2026-10-12 IST — Relaunch spec: bring Cherishu live (founder: "make it live in saas")

**What:** relaunch the employee recognition and rewards platform at cherishu.talkytools.com (it was deployed once in May, containers later gone, DNS and server folder still there). **Why:** founder wants it live in the SaaS group. **Done when:** container healthy, `/api/health` 200, `/sup-min` gated, super admin can log in with a generated password, no default passwords anywhere. **Out of scope:** payments, email provider, demo data, new features. **Verify:** curl routes, container Created time, log check.
**Hardening done on branch `feat/prod-launch-hardening` (before any deploy):** `package-lock.json` synced (Playwright was in package.json but not the lock, so Docker `npm ci` would have failed); compose no longer falls back to a default DB password (`${POSTGRES_PASSWORD:?}`), app port bound to 127.0.0.1 (was 0.0.0.0), restart `unless-stopped`; `prisma/seed.ts` takes passwords from `SEED_*` env and throws in production if missing, and in production seeds only the super admin unless `SEED_DEMO=1`. `tsc` 0 errors, `next build` ok.
**Second review (agent): SHIP with minor fixes, applied:** `AUTH_SECRET` now required in compose; login rate-limit IP now X-Real-IP first (was the forgeable first X-Forwarded-For hop). Noted, not changed: old docs (CREDENTIALS.md, CHANGELOG.md, COMMS.md 2026-04) still list the former dev default passwords, never set those in production; do not use `SEED_DEMO=1` in production (summary prints passwords).
**DEPLOYED 2026-10-12 ~16:46 IST** as ae75d3f (rollback sha 47fe0a3, the May build) on port 3045. Steps: pulled on the real folder `/home/ubuntu/cherishu` (`/home/ubuntu/Cherishu` is a symlink to it); waited out another session's concurrent `docker compose up --build` (sequential rule); `docker compose build app` exit 0; db up healthy; the prod image's Prisma CLI is missing a dependency (`prisma: not found` / module error), so schema push + seed ran from a throwaway `node:22` container on `cherishu_cherishu_net` (temp env file deleted): 18 tables, 1 PlatformAdmin, demo data skipped (`SEED_DEMO` unset). App healthy; enabled the existing May nginx vhost (added the robots.txt rule).
**Evidence:** container Created 11:16:03 UTC, `/api/health` 200 `db: connected`, `/`, `/login`, `/pricing`, `/privacy`, `/terms` 200, `/sup-min` shows the sign-in form, `/sup-min/dashboard` and `/dashboard` 307 to login, wrong super-admin password 401, `X-Robots-Tag: noindex`, HSTS + CSP present, 0 errors in logs.
**Super admin:** `superadmin@cherishu.com` at `/sup-min`; the password is in the server `.env` as `SEED_SUPERADMIN_PASSWORD` (generated on the server, never printed). Founder: read it once, then change it.
**Open (not blocking):** no feedback widget yet (parity item); no cron entries scheduled for `/api/cron/*` routes (both need `CRON_SECRET`); payments/email provider not configured; old docs (CREDENTIALS.md, CHANGELOG.md) still list the former dev default passwords, never use them.

---

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

## [2026-04-26] Master Hub Broadcast v3 Done

- **Step 0** Stashed + pulled Master Hub commits: ✓ (only `CONTEXT.md` and `.github/workflows/` were untracked, both intentional)
- **Step 1** Pull --rebase: ✓ (already up to date)
- **Step 2** Privacy/Terms/Refund customized: ✓ (Cherishu-specific copy, India jurisdiction, real refund terms — done in v1)
- **Step 3** /api/health verified: ✓ (returns 200 with DB ping; 503 on DB failure — done in v2)
- **Step 4** Seed verified, 3 standard users in DB: ✓ (`superadmin@cherishu.com`, `admin@cherishu.com`, `user@cherishu.com` live in production)
- **Step 5** Footer + EmptyState + CookieConsent imported: ✓ (done in v1+v2)
- **Step 6** CI/Security workflows + Dependabot + PR template: ✓ **JUST UNBLOCKED** — token now has `workflow` scope, both `ci.yml` and `security-scan.yml` pushed in commit `225db2f`. CI + Security scan runs both kicked off automatically on this push.
- **Step 7** SEO foundation (robots/sitemap/OG/Schema): ✓ (done in v1)
- **Step 8** Standard package.json scripts: ✓ (done in v1)
- **Step 9** CHANGELOG.md created: ✓ (done in v2)
- **Step 10** Sentry: **N/A** (Cherishu not on Tier 1+2 list)
- **Step 11** Security headers in next.config.ts: ✓ HSTS (2y, preload), X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy camera/mic/geo off, poweredByHeader: false, compress: true
- **Step 12** Favicon updated: ✓ Copied `_shared/templates/favicon.svg` → `public/favicon.svg`, icons metadata updated in `app/layout.tsx`
- **Step 13** Pushed to main: ✓ commits `c46c9e0` (workflows) + `225db2f` (security headers + favicon)
- **Step 14** NOT redeployed per instruction
- **Step 15** This update

**Open** — Dependabot already raised 2 PRs on the new repo (one merged successfully). Will review and merge after coordinated deploy.

### Standard Footer (added earlier same day)

- Copied `_shared/templates/components/Footer.tsx.template` → `src/components/Footer.tsx`
- Replaced `{{PROJECT_NAME}}` → "Cherishu", `{{COMPANY}}` → "TalkyTools"
- Imported in `MarketingShell.tsx` (replaces inline footer)
- 4-column layout: Brand · Product · Legal · TalkyTools Family (cross-links to Optimo, BillForge, SeizeLead per template)
- Build verified, no regressions
- Commit `8dfde31`

## Earlier broadcasts (already absorbed)

- 2026-04-24: Cherishu launched with full feature set (R&R core, marketplace, billing, manager console, audit log, public pages, lead capture). See `git log` for full history.
