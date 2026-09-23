# sekaishi-anki

A web quiz app for memorizing world-history events and years. Sign in with Supabase Auth to sync your review queue, stats, and settings to the cloud. Supabase environment variables are **required**.

## Features

- **Two quiz modes**: event → year (typed input) and year → event (4 choices)
- **Scope filters**: by region/chapter or by period (derived from year)
- **Auth**: email + password via Supabase
- **Review queue**: wrong answers are saved; correct answers in a review session graduate them (UI lives under the Stats tab)
- **Stats & ranks**: accuracy, streak, and point-based ranks synced to `profiles`
- **Question submissions**: user posts go to `wh_submissions` (pending admin approval outside the app)
- **Theme**: light / dark, stored on the profile

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS + Lucide React
- Supabase (Auth, PostgreSQL, RLS)
- Netlify (static hosting)

## Quick start

```bash
pnpm install
cp .env.example .env
# Required: VITE_SUPABASE_URL and VITE_SUPABASE_PB_KEY
pnpm dev
```

```bash
pnpm typecheck
pnpm build
pnpm preview
```

## Documentation

| Doc                                                    | Topic                                 |
| ------------------------------------------------------ | ------------------------------------- |
| [docs/overview.md](docs/overview.md)                   | Product scope, tabs                   |
| [docs/quiz.md](docs/quiz.md)                           | Quiz modes, filters, data loading     |
| [docs/auth-and-sync.md](docs/auth-and-sync.md)         | Auth, profile sync, localStorage keys |
| [docs/review-and-stats.md](docs/review-and-stats.md)   | Review queue, ranks, category bars    |
| [docs/submissions.md](docs/submissions.md)             | Submit form and approval status       |
| [docs/database.md](docs/database.md)                   | Schema, migrations, RLS               |
| [docs/local-development.md](docs/local-development.md) | Env, scripts, Netlify deploy          |
| [docs/roadmap.md](docs/roadmap.md)                     | Honest backlog                        |
| [supabase/README.md](supabase/README.md)               | Supabase setup steps                  |

Historical Japanese planning notes live under [`docs/archive/`](docs/archive/).

## Project layout

| Path                           | Role                                                       |
| ------------------------------ | ---------------------------------------------------------- |
| `src/`                         | React app                                                  |
| `src/contexts/AuthContext.tsx` | Auth, profile, DB sync helpers                             |
| `src/lib/questions.ts`         | Question fetch from Supabase (`wh_dates`)                  |
| `src/features/`                | Quiz, stats, submit, settings, auth screens                |
| `supabase/migrations/`         | User tables, RLS, submission guardrails                    |
| `supabase.sql`                 | Existing question master schema (`wh_dates`, `wh_regions`) |

## Deploy (Netlify)

1. Connect the repo; `netlify.toml` already sets `pnpm run build` → `dist`.
2. Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PB_KEY`.
3. Add the Netlify URL to Supabase Auth redirect URLs.

SPA fallback (`/*` → `/index.html`) is configured in `netlify.toml`.
