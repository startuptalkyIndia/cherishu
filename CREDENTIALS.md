# Cherishu — Credentials

> Standard TalkyTools credentials per `_shared/templates/seed.template.ts`.
> Do not commit production-modified passwords. Rotate before public launch.

## Live URLs

- Public site: https://cherishu.talkytools.com
- Workspace login: https://cherishu.talkytools.com/login
- Super admin: https://cherishu.talkytools.com/sup-min  *(noindex, never linked from public UI)*

## Credentials (corrected 2026-10-12)

There are NO default passwords. Earlier versions of this file listed the platform's standard seed passwords; they do not exist on production and must not be assumed to.

- `prisma/seed.ts` reads `SEED_SUPERADMIN_PASSWORD`, `SEED_ADMIN_PASSWORD`, `SEED_DEMO_PASSWORD` from the environment and refuses to run without them.
- In production the seed creates ONLY the PlatformAdmin (`/sup-min`). The demo workspace (Acme Inc.) and demo users are created only outside production or with `SEED_DEMO=1`.
- The live super-admin password is held by the founder and was never written to this repo. Change it at first login and rotate before any public launch.
- Local development: set the three `SEED_*` variables in your own `.env` (not committed), then `npx prisma db seed`.

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
