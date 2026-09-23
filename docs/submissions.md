# Submissions

UI: `src/features/submit/SubmitTab.tsx`. Insert path: `AuthContext` / database helpers.

## Form

Users can submit:

- Event name (required; blank and length limits enforced in UI and DB)
- Year and optional end year (negative years = BCE)
- Field (Japanese values matching `wh_dates.field` check constraint)
- Regions (keys from `wh_regions`)
- Optional description
- Wikipedia OpenSearch helper for discovery
- Honeypot field for basic bot resistance

Allowed `field` values (must match master data):

- `政治`, `経済`, `文化・宗教`, `社会`, `外交・戦争`

English labels in the form are mapped via `src/lib/submit-mappers.ts`.

## Lifecycle

1. Insert into `wh_submissions` with `status: 'pending'`.
2. User can view their past submissions (loaded from Supabase; optional local cache).
3. **Admin approval** (pending → approved / rejected, copy into `wh_dates`) is **not** implemented in this app. Submitted events do not enter the quiz pool until they exist in `wh_dates`.

## Database guardrails

Migration `20260924_00_submission_guardrails.sql` adds CHECKs:

- Event trimmed length &gt; 0
- Event ≤ 300 characters
- Description ≤ 2000 characters (or null)

Apply this migration after the init migration. See [database.md](database.md).
