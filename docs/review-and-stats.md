# Review and stats

Both live primarily under the **Stats** tab (`src/features/stats/StatsTab.tsx`) and orchestration in `App.tsx`.

## Review queue

- Wrong answers after a normal quiz are upserted (online → `review_items`; always mirrored to `sekaishi-reviews`).
- UI: list items, start all, start one, remove manually.
- In a review session, answering correctly **graduates** the item (delete from queue).
- Columns `review_count` / `last_reviewed_at` exist on the table but are not meaningfully updated by the app today.
- There is **no** spaced-repetition (SRS) schedule yet.

## Stats overview

| Metric | Source when online | Offline |
| ------ | ------------------ | ------- |
| Total answered / correct | `profiles` via `saveQuizResults` | local profile |
| Accuracy | derived | derived |
| Streak (current / best) | `profiles` | local profile |
| Rank | `rank_points` → `getRank()` in `App.tsx` | same client formula |

### Rank thresholds

| Points | Rank |
| ------ | ---- |
| &lt; 100 | Apprentice (見習い史家) |
| &lt; 300 | Novice (初学者) |
| &lt; 700 | Chronicler (年代記者) |
| &lt; 1500 | Historian (歴史家) |
| &lt; 3000 | Scholar (碩学) |
| ≥ 3000 | Witness (歴史の証人) |

## Category bars

Horizontal bars use **chapter heuristics** stored in `sekaishi-category-stats` (localStorage). They are **not** backed by the `field_stats` table.

`field_stats` exists with RLS and is cleared on account delete, but the app does not write to it yet. `recharts` is a dependency and is unused in `src/`.
