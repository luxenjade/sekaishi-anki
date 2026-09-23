# Auth and sync

## Authentication

- **Provider**: Supabase Auth, email + password (`src/features/auth/AuthScreen.tsx`)
- **Session**: `onAuthStateChange` in `src/contexts/AuthContext.tsx`
- **Gate**: `App.tsx` renders `AuthScreen` until a user exists
- **Config**: if `VITE_SUPABASE_*` is missing, AuthScreen shows a blocking error (no guest/demo continue)

| Capability                       | Status                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Sign up / sign in                | Implemented                                                                                              |
| Post-signup confirmation message | Implemented (no dedicated `/auth/callback` route)                                                        |
| Password reset email             | Settings can call `resetPasswordForEmail` (redirect `/`); **no** in-app new-password form after the link |
| OAuth                            | Not implemented                                                                                          |
| Account delete                   | Clears app tables, calls `rpc('delete_user')` when available, then signs out                             |

## Profile fields

Stored on `profiles` (created by trigger `handle_new_user` on signup):

- `username`, `theme` (`light` | `dark` | `system`)
- Aggregates: `total_answered`, `total_correct`, `streak_current`, `streak_best`, `last_played_at`, `rank_points`
- `quiz_mode` / `avatar_url` exist in the schema but are not driven by the current Settings UI

Theme is applied via `useTheme` and can sync to `profiles.theme`.

## What syncs vs local cache

| Data                    | Cloud            | Local cache (optional mirror)  |
| ----------------------- | ---------------- | ------------------------------ |
| Profile totals & streak | `profiles`       | —                              |
| Review queue            | `review_items`   | `sekaishi-reviews`             |
| Submissions list        | `wh_submissions` | `sekaishi-submissions`         |
| Category accuracy bars  | —                | `sekaishi-category-stats` only |
| Quiz history list       | —                | `sekaishi-history`             |
| Theme preference        | `profiles.theme` | `sekaishi-anki:theme`          |

Only numeric master question IDs are persisted to `review_items` (`isPersistableQuestionId`).
