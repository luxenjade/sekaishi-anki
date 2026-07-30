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
| `field_stats` | migration | Per-field accuracy (future) |

## 1. Create / connect Supabase project

Copy **Project URL** and **anon key** into `.env`:

```bash
cp .env.example .env
```

## 2. Apply user tables migration

**Do not** recreate `wh_dates` / `wh_regions` — they already exist.

In **SQL Editor**, run only:

```
supabase/migrations/20260711000000_init.sql
```

This adds `profiles`, `review_items`, `wh_submissions`, RLS policies, and auth triggers.

## 3. Configure Auth

- Enable Email provider
- Set Site URL and Redirect URLs (Netlify + `http://localhost:5173/**`)

## App ↔ DB mapping

The React app maps `wh_dates` rows as follows:

| DB column | App field | Notes |
| --------- | --------- | ----- |
| `year` | `year`, `is_bc` | `year < 0` → 紀元前 |
| `region[]` | `chapter` (filter), `region` | 地域ラベルを出題範囲に使用 |
| (derived) | `period` | `year` からクライアント算出 |
| `field` | `field` | 日本語 → 内部 enum に変換 |

Only `record_type = 'event'` rows with non-null `year` are fetched for quizzes.

## wh_submissions field values

Must match `wh_dates.field` check constraint:

- `政治`, `経済`, `文化・宗教`, `社会`, `外交・戦争`

The submit form maps English labels to these automatically.
