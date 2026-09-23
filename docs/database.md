# Database

Schema is split on purpose:

| Source                                                                                                                      | Contents                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`supabase.sql`](../supabase.sql)                                                                                           | Master data: `wh_dates`, `wh_regions` (existing / do not recreate blindly) |
| [`supabase/migrations/20260711_00_init.sql`](../supabase/migrations/20260711_00_init.sql)                                   | User tables, RLS, auth trigger, `delete_user` RPC                          |
| [`supabase/migrations/20260924_00_submission_guardrails.sql`](../supabase/migrations/20260924_00_submission_guardrails.sql) | CHECK constraints on `wh_submissions`                                      |

Operational setup steps: [`supabase/README.md`](../supabase/README.md).

## Tables

| Table            | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| `wh_dates`       | Question master                                    |
| `wh_regions`     | Region keys / labels                               |
| `profiles`       | Settings + denormalized stats                      |
| `review_items`   | Per-user review queue (`question_id` → `wh_dates`) |
| `wh_submissions` | User-proposed events                               |
| `field_stats`    | Per-field accuracy (schema ready; **app unused**)  |

There is no `quiz_logs` table in the current migrations.

## Apply order

1. Ensure `wh_dates` / `wh_regions` exist (from `supabase.sql` or an existing project).
2. Run `20260711_00_init.sql` in the SQL Editor (or via Supabase CLI).
3. Run `20260924_00_submission_guardrails.sql`.

## RLS summary

| Table                     | SELECT   | INSERT              | UPDATE | DELETE |
| ------------------------- | -------- | ------------------- | ------ | ------ |
| `wh_dates` / `wh_regions` | Everyone | —                   | —      | —      |
| `profiles`                | Owner    | Owner               | Owner  | Owner  |
| `field_stats`             | Owner    | Owner               | Owner  | —      |
| `review_items`            | Owner    | Owner               | Owner  | Owner  |
| `wh_submissions`          | Owner    | Authenticated owner | —      | —      |

Signup creates a profile via trigger `on_auth_user_created` → `handle_new_user()`.

## App mapping notes

- Quizzes load only `record_type = 'event'` rows with non-null `year`.
- Period filters are computed in the client (`src/lib/periods.ts`).
- Account deletion clears user rows then calls `delete_user()` when the RPC is available.
