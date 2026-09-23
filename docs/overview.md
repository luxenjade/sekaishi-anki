# Overview

sekaishi-anki is a mobile-first SPA for drilling world-history years. After authentication (or demo bypass), the shell is a four-tab app with no client-side URL router — navigation is React state only.

## Information architecture

| Tab | Role |
| --- | ---- |
| **Quiz** | Setup → session → result; mistakes feed the review queue |
| **Stats** | Totals, streak, rank, category bars, **and** the review queue UI |
| **Submit** | Propose new events (`wh_submissions`) |
| **Settings** | Username, theme, password reset email, clear data, sign-out / delete account |

Unauthenticated users only see `AuthScreen`. There is no separate Review tab (older blueprints assumed five tabs).

## Demo mode vs cloud

| | Demo (env unset) | Cloud (env set) |
| --- | --- | --- |
| Entry | “Continue in demo mode” on AuthScreen | Email + password sign-in / sign-up |
| User | Mock `offline-user` via `bypassAuth()` | Supabase Auth session |
| Questions | `src/data/mockEvents.ts` | `wh_dates` (mock fallback on empty/error) |
| Progress | localStorage only | `profiles`, `review_items`, `wh_submissions` (+ localStorage mirrors) |

Configured via `VITE_SUPABASE_URL` and `VITE_SUPABASE_PB_KEY`. See [auth-and-sync.md](auth-and-sync.md) and [local-development.md](local-development.md).

## Design notes

- Accent / feedback colors follow the yellow–dark quiz theme (`qz-accent`, correct/incorrect tokens in Tailwind).
- Dark mode toggles a `.dark` class on the document root.
- Japanese UI copy is intentional for the product audience; this `docs/` tree is English for maintainers.
