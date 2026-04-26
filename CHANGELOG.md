# Changelog — Cherishu

All notable changes to Cherishu will be documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/)

---

## [Unreleased]

### Added
- Standard TalkyTools components: Footer, EmptyState, CookieConsent
- `/api/health` endpoint with DB connectivity check
- Standard package.json scripts: `db:migrate`, `db:reset`
- CI workflow + security scan workflow + Dependabot + PR template
- This CHANGELOG

### Changed
- `prisma/seed.ts` now uses standard TalkyTools credentials (`Shu_bham12!` / `Admin@2026!` / `User@2026!`)
- `MarketingShell` footer replaced with shared `<Footer />` component

---

## [0.5.0] — 2026-04-26 · Public surface + lead capture

### Added
- Polished public marketing pages: `/`, `/features`, `/pricing`, `/security`, `/faq`, `/contact`
- Legal pages: `/privacy`, `/terms`, `/refund`
- SEO foundation: `app/robots.ts`, `app/sitemap.ts`, Open Graph + Twitter Card metadata, Schema.org JSON-LD (Organization + SoftwareApplication + WebSite)
- Lead capture: `Lead` model + `POST /api/leads` + super admin CRM at `/sup-min/leads` with status pipeline (new → contacted → qualified → demo_booked → converted → lost)
- Manager console at `/dashboard/team` (direct reports + low-engagement warnings)
- HR Admin Activity Log at `/admin/activity` with filters
- Audit log writes wired to 12+ action sites
- Recognition quick-templates (8 presets) on send-kudos page
- Nomination approval flow (Award/Reject buttons + auto-convert to kudos with email + chat post + audit)

---

## [0.4.0] — 2026-04-25 · Billing + onboarding + filters

### Added
- Billing system: Razorpay-ready `Subscription` + `PaymentEvent` models, Free/Pro/Enterprise plans, seat enforcement (10-user cap on Free)
- HR admin Billing page (current plan card, plan chooser, billing email, monthly bill calculator)
- Super admin Billing dashboard (MRR, active/trial counts, paid conversion %)
- Razorpay webhook at `/api/webhooks/razorpay` with HMAC SHA-256 signature verification
- Stub mode: 14-day trial without payment when no Razorpay keys configured
- Onboarding "Get Started" checklist on HR admin home
- One-click demo data generator (6 teammates + 15 kudos + reactions/comments + nominations)
- `FilterBar` primitive: URL-driven search + filter chips + sort + pagination
- Filter pass on 7 key tables: Users, Redemptions, Rewards Catalog, Workspaces, Merchants, Audit Log, Leaderboard

---

## [0.3.0] — 2026-04-24 · Marketplace + chat + email + auto-kudos

### Added
- Marketplace model: `Merchant` entity with commission % per merchant + bulk CSV catalog import + per-merchant order handoff (email/webhook/manual)
- `MARKETPLACE` reward provider — emails merchant on redemption with order ref + recipient + shipping + commission breakdown
- Auto-kudos for birthdays + work anniversaries (daily cron at 9am IST, idempotent, customizable templates with `{name}` `{years}` `{s}` placeholders)
- Email notifications via Resend (5 types: welcome, kudos received, redemption fulfilled, nomination pending, weekly HR digest)
- Weekly HR digest cron (Monday 9am IST)
- Chat integrations: Slack Block Kit + Teams MessageCard + Discord embeds + generic webhook (per-workspace URL + per-event toggles)
- Platform settings page at `/sup-min/platform-settings` (Resend + Razorpay configuration)

---

## [0.2.0] — 2026-04-24 · Robust admin panels

### Added
- Super admin (8 sections): Workspaces CRUD, Platform Rewards, Platform Admins, Audit Log, Analytics
- HR admin (analytics, values & badges CRUD, bulk CSV user import, bulk points top-up, CSV exports)
- Employee: profile page, user profile pages, nomination flow, reactions + comments on feed
- `User.managerId` for direct-reports
- Schema: nullable `Recognition.senderId` + `isSystem` + `kind` (for system-generated kudos)

---

## [0.1.0] — 2026-04-24 · Initial release

### Added
- Multi-tenant workspaces with company values + badges + 4 default roles (EMPLOYEE / MANAGER / HR_ADMIN / SUPER_ADMIN)
- Peer recognition with points, badges, values
- Reward catalog: 9 types (Gift Card, Experience, Merchandise, Cashback, Charity, Custom Swag, Voucher, Subscription, Travel)
- Provider abstraction layer: Manual, Marketplace, Xoxoday, Tremendous, Amazon Incentives, Giftbit, Custom API
- Redemption flow with auto-refund on provider failure
- Leaderboards (top givers + receivers, monthly)
- Hidden super admin at `/sup-min` (noindex, never linked from UI)
- Indigo Tailwind theme matching TalkyTools design system
- Multi-stage Docker build (Next.js standalone) + production docker-compose with mem_limit/cpus
- Live at https://cherishu.talkytools.com on AWS Lightsail Mumbai (port 3045)
