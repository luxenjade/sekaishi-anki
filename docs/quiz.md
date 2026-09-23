# Quiz

Implementation lives under `src/features/quiz/`, `src/hooks/useQuiz.ts`, and `src/lib/quiz.ts`.

## Modes

| Mode | Interaction | Filter axis |
| ---- | ----------- | ----------- |
| `event-to-year` | Type a year (`-221` for 221 BCE) | Chapter / region label |
| `year-to-event` | Pick 1 of 4 events | Period (derived from year) |

Quiz mode is chosen on the start screen for the current session. It is **not** persisted to `profiles.quiz_mode` in the current UI.

## Setup options

- **Scope**: all questions, or one chapter/region / one period
- **Count**: 5, 10, 20, or all available in the filtered set
- **Periods**: computed client-side in `src/lib/periods.ts` (there is no `period` column on `wh_dates`)

## Session flow

1. **Start** — load questions, shuffle, start timer/progress state
2. **Playing** — inline correct/incorrect feedback, then next
3. **Result** — score, mistake list, retry all / retry mistakes only, abort mid-quiz supported

Mistakes from a normal session are upserted into the review queue. During a **review** session, a correct answer removes that item from the queue.

## Question loading

`src/lib/questions.ts` → `fetchQuestions()`:

1. If Supabase is not configured → `{ items: [], error: "not-configured" }`
2. If configured → select from `wh_dates` where `record_type = 'event'` and `year` is not null
3. On empty result or API error → empty items + `error: "empty" | "error"` (StartScreen blocks start)

There is **no** client-side mock question set.

DB → app mapping (also documented in `supabase/README.md`):

| DB | App |
| -- | --- |
| `year` (&lt; 0 → BCE) | `year`, `is_bc` |
| `region[]` | used as chapter/region filters |
| `field` | Japanese labels mapped to internal enums |
| (derived) | `period` via `getPeriodFromYear` |
