# Local development and deploy

## Prerequisites

- Node.js + [pnpm](https://pnpm.io/)
- A Supabase project (required — no offline demo)

## Environment

```bash
cp .env.example .env
```

| Variable               | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `VITE_SUPABASE_URL`    | Supabase project URL                                              |
| `VITE_SUPABASE_PB_KEY` | Supabase **anon** (public) key — name is intentional in this repo |

Both must be set. Without them the app shows a configuration error on the auth screen and will not load questions.

## Scripts

| Command          | Action                       |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Vite dev server              |
| `pnpm typecheck` | `tsc --noEmit`               |
| `pnpm lint`      | ESLint                       |
| `pnpm build`     | Production build to `dist/`  |
| `pnpm preview`   | Preview the production build |

## Supabase Auth redirects

Add at least:

- `http://localhost:5173/**` (or your Vite port)
- Production Netlify URL(s)

Enable the Email provider in the Supabase dashboard.

## Netlify

Configured in [`netlify.toml`](../netlify.toml):

- Build: `pnpm run build`
- Publish: `dist`
- SPA redirect: `/*` → `/index.html` (200)

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PB_KEY` in the Netlify environment UI. Vite embeds these at **build** time.

## What is not in this repo

- No Docker / Compose files
- No offline demo / mock question dataset
- No PWA plugin or service worker
