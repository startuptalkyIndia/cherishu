# PRODUCTION SYNC PROTOCOL
> Every agent working on this project MUST follow this checklist before considering any task done.

## After Every Code Change
- [ ] Run `git add` + `git commit` + `git push origin main`
- [ ] No hardcoded passwords, secrets, or API keys in source code
- [ ] No sensitive data in console.log statements

## Before Every Deploy
- [ ] `git pull origin main` on server
- [ ] `docker compose up -d --build --force-recreate`
- [ ] Verify HTTP 200: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3045/`
- [ ] Check logs: `docker compose logs app --tail 20`

## Security Checklist (check on every PR)
- [ ] Security headers in next.config.ts (CSP, HSTS, X-Frame-Options)
- [ ] All API routes have auth guards
- [ ] No hardcoded secrets in source code
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with Zod on all user-facing endpoints
- [ ] /sup-min and /admin routes protected at middleware level

## Staying In Sync — Full 12-Point Checklist
1. Code: local changes committed and pushed to GitHub main
2. Security: headers, auth guards, no hardcoded secrets, rate limiting
3. Dependencies: npm audit fix run, no high/critical vulns
4. Server: git pull done, docker rebuild done, container healthy
5. Database: migrations applied (prisma db push), seed data exists
6. Env vars: all required vars set in server .env (email, AI, payments, auth)
7. Functional: login works, core feature works, admin panel works
8. Email: transactional emails sending (test with real inbox)
9. Payments: payment flow tested (if applicable)
10. Domain/SSL: subdomain resolves, SSL cert valid
11. Monitoring: daily automated check running, errors logged
12. Legal: Privacy Policy, Terms of Service pages exist

## Daily Automated Check
Runs at 9:17 AM IST — checks containers, RAM, HTTP status, logs, git sync.
Reports via push notification.

## Deep Check (Every 4 Days)
Runs at 10:23 AM IST — full audit including login test, SSL expiry, log analysis, security regression check.

---

