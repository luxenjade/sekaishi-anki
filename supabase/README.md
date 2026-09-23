# Supabase setup

This app uses Supabase for authentication and user data. **Question master tables already exist** — see [`supabase.sql`](../supabase.sql) at the repo root.

## Schema overview

| Table | Source | Purpose |
| ----- | ------ | ------- |
| `wh_dates` | `supabase.sql` (existing) | Question master — `year`, `event`, `region[]`, `field` (Japanese) |
| `wh_regions` | `supabase.sql` (existing) | Region labels |
| `profiles` | migration | User settings & stats |
| `review_items` | migration | Review queue |
| `wh_submissions` | migration | User submissions |
| `field_stats` | migration | Per-field accuracy (table ready; app does not write yet) |

## 1. Create / connect Supabase project

Copy **Project URL** and **anon key** into `.env`:

```bash
cp .env.example .env
```

Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PB_KEY`.

## 2. Apply migrations

**Do not** recreate `wh_dates` / `wh_regions` — they already exist.

In **SQL Editor**, run in order:

1. `supabase/migrations/20260711_00_init.sql` — `profiles`, `review_items`, `wh_submissions`, `field_stats`, RLS, auth trigger, `delete_user`
2. `supabase/migrations/20260924_00_submission_guardrails.sql` — length / non-blank CHECKs on submissions

## 3. Configure Auth

- Enable Email provider
- Set Site URL and Redirect URLs (Netlify + `http://localhost:5173/**`)

## App ↔ DB mapping

The React app maps `wh_dates` rows as follows:

| DB column | App field | Notes |
| --------- | --------- | ----- |
| `year` | `year`, `is_bc` | `year < 0` → BCE |
| `region[]` | `chapter` (filter), `region` | Region labels used as quiz scope |
| (derived) | `period` | Computed from `year` on the client |
| `field` | `field` | Japanese → internal enum |

Only `record_type = 'event'` rows with non-null `year` are fetched for quizzes.

## wh_submissions field values

Must match `wh_dates.field` check constraint:

- `政治`, `経済`, `文化・宗教`, `社会`, `外交・戦争`

The submit form maps English labels to these automatically.

More detail: [`docs/database.md`](../docs/database.md).
