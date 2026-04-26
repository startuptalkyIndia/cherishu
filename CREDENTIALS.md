# Cherishu — Credentials

> Standard TalkyTools credentials per `_shared/templates/seed.template.ts`.
> Do not commit production-modified passwords. Rotate before public launch.

## Live URLs

- Public site: https://cherishu.talkytools.com
- Workspace login: https://cherishu.talkytools.com/login
- Super admin: https://cherishu.talkytools.com/sup-min  *(noindex, never linked from public UI)*

## Standard credentials (matches seed)

Cherishu uses two parallel auth systems:

| Role | Auth table | URL | Email | Password |
|---|---|---|---|---|
| **Super Admin** | `PlatformAdmin` | `/sup-min` | `superadmin@cherishu.com` | `Shu_bham12!` |
| **Admin (HR_ADMIN)** | `User` | `/login` | `admin@cherishu.com` | `Admin@2026!` |
| **Demo User (EMPLOYEE)** | `User` | `/login` | `user@cherishu.com` | `User@2026!` |

Demo workspace seeded: **Acme Inc.** (slug `acme`) with 5 additional teammates (`priya@`, `raj@`, `anita@`, `vikram@`, `sana@` — all `@cherishu.com` / `User@2026!`).

## Server / infra

- Server: AWS Lightsail (Mumbai), `13.202.189.233`
- App container: `cherishu-app` on port `3045`
- DB container: `cherishu-db` (postgres 16, internal docker network only)
- Project folder on server: `~/cherishu`
- Repo: https://github.com/startuptalkyIndia/cherishu

## Production secrets (set on server in `~/cherishu/.env`)

These must NOT be committed. Listed here for reference only:

| Key | Purpose |
|---|---|
| `POSTGRES_PASSWORD` | DB password |
| `AUTH_SECRET` | Auth.js JWT signing |
| `CRON_SECRET` | Bearer auth for daily/weekly cron endpoints |
| `RESEND_API_KEY` | (optional) Set via `/sup-min/platform-settings` for email send |
| `RAZORPAY_KEY_ID/SECRET` | (optional) Set via `/sup-min/platform-settings` for live billing |

## Cron jobs on server

```
30 3 * * *  /api/cron/auto-kudos       (9am IST daily — birthdays + anniversaries)
30 3 * * 1  /api/cron/weekly-digest    (Mon 9am IST — HR weekly recap email)
```
