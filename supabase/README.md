# Supabase schema

Versioned SQL migrations for ATMAN's Postgres schema.

## Files

- `migrations/001_initial_schema.sql` — initial tables, RLS, signup triggers
- `migrations/002_rls_hardening.sql` — split RLS policies for `distributions`, `updated_at` auto-trigger, composite indexes, hardened `SECURITY DEFINER` functions

## Apply

In a fresh Supabase project, run each file in order from the SQL editor (or `supabase db push` if using the CLI).

The app runs in `DEMO_MODE` whenever `NEXT_PUBLIC_SUPABASE_URL` is missing, set to a placeholder, or fails the `http` prefix check (see `src/lib/supabase/client.ts`). No Supabase round-trip happens in demo mode, so demo data renders without a connected DB.

## Invariants enforced at the DB layer

- **RLS** on every user-scoped table; default-deny.
- **Distribution integrity**: a row in `distributions` can only reference a `wallets.id` and `heirs.id` that belong to `auth.uid()`. Enforced by `WITH CHECK` clauses in `002`.
- **Distribution percent**: `0 ≤ percentage ≤ 100`. (Database CHECK; the 100%-sum invariant is enforced client-side and tested in `tests/lib/distribution.test.ts`.)
- **Audit immutability**: `activity_log` allows `INSERT` and `SELECT` only — no `UPDATE`/`DELETE` policies. RLS denies them by default.
- **`updated_at`** is auto-maintained by a `BEFORE UPDATE` trigger so client code can't fake timestamps.
- **`SECURITY DEFINER`** functions pin `search_path` to prevent schema-hijacking privilege escalation.

## What's still missing for production

- Server-side validation that distributions per `wallet_id` sum to exactly 100 — currently a client-side check only.
- Backups / point-in-time recovery configured in the Supabase dashboard.
- Monitoring + alerting on policy denials.
