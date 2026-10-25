# TASKS

## To Do

### From the fleet scan and security wave, 2026-10-26 (written by the Manage-all-Tech session; owner session does these)
> Report: `_shared/docs/fleet-checks-20261026.md`. Branches ship WITH the product's next deploy (founder 2026-10-26); each branch change still needs a different reviewer.
- [ ] Parked: `CREDENTIALS.md` is tracked (remove/untrack), `src/lib/platform-auth.ts` returns a literal dev secret when the env var is unset (fail closed), 2 admin pages use `Math.max(1, parseInt(...))` (NaN on `?page=abc`); main holds 2 undeployed code commits (global-error reload, robots). Before relaunch: remove the prefix from `ARCHIVED=(...)` in `enforce-archived-stopped.sh`.
- [ ] Monthly housekeeping card for this product: `_shared/HOUSEKEEPING.md` Appendix F (10 checks); run it in the week before the last Saturday of each month and write one COMMS entry 'Monthly check YYYY-MM'.

