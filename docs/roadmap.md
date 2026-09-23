# Roadmap

Backlog relative to the **current** codebase (not the archived Japanese plans). Items are unordered within each group.

## Likely next product work

- Password-reset **landing UI** after the email link (Settings only sends the email today)
- Guest progress → account merge when signing in after demo use
- Admin workflow: review `wh_submissions` and promote approved rows into `wh_dates`
- Wire `field_stats` (or keep category stats local intentionally) and/or charts with `recharts`
- Spaced repetition for the review queue (`review_count` / due dates)

## Platform / UX

- Client-side routing (deep links: `/quiz`, `/stats`, `/auth`, …)
- Toast / global notification layer
- OAuth providers (Google, etc.)
- Avatar upload via Supabase Storage
- PWA (`vite-plugin-pwa`) and offline sync queue

## Engineering hygiene

- Further split orchestration still concentrated in `App.tsx`
- Generated DB types (`supabase gen types typescript`)
- Vitest for quiz helpers / streak / rank
- CI: lint + typecheck + build on GitHub Actions
- Optionally consolidate master + user schema under a single migrations story

## Archived design docs

Earlier blueprints and audits (Japanese) are preserved under [`archive/`](archive/) for historical context. Prefer this folder’s English docs as the source of truth for “what ships today.”
