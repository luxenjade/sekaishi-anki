# Overview

sekaishi-anki is a mobile-first SPA for drilling world-history years. After authentication, the shell is a four-tab app with no client-side URL router — navigation is React state only.

## Information architecture

| Tab | Role |
| --- | ---- |
| **Quiz** | Setup → session → result; mistakes feed the review queue |
| **Stats** | Totals, streak, rank, category bars, **and** the review queue UI |
| **Submit** | Propose new events (`wh_submissions`) |
| **Settings** | Username, theme, password reset email, clear data, sign-out / delete account |

Unauthenticated users only see `AuthScreen`. Supabase env vars are **required** — there is no offline demo mode.

## Requirements

| | |
| --- | --- |
| Auth | Supabase Auth (email + password) |
| Questions | `wh_dates` via Supabase (empty/error blocks quiz start) |
| Progress | `profiles`, `review_items`, `wh_submissions` |

Configured via `VITE_SUPABASE_URL` and `VITE_SUPABASE_PB_KEY`. See [auth-and-sync.md](auth-and-sync.md) and [local-development.md](local-development.md).

## Design notes

- Accent / feedback colors follow the yellow–dark quiz theme (`qz-accent`, correct/incorrect tokens in Tailwind).
- Dark mode toggles a `.dark` class on the document root.
- Japanese UI copy is intentional for the product audience; this `docs/` tree is English for maintainers.
