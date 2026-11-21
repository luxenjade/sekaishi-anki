import type { HistoryQuizItem, Profile } from "../types/quiz";
import { getPeriodFromYear } from "./periods";
import { CHAPTER_LABEL, isQuestionTheme } from "./taxonomy";

/** wh_dates を取得するときの select 列（questions / admin で共通） */
export const DB_WH_DATE_COLUMNS =
  "id, year, event, description, chapter, tags, theme, wiki_url, is_published";

export interface DbProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  theme: "light" | "dark" | "system";
  total_answered: number;
  total_correct: number;
  streak_current: number;
  streak_best: number;
  last_played_at: string | null;
  rank_points: number;
  created_at?: string;
  updated_at?: string;
}

/** wh_dates（再構築後のスキーマ）。DB_WH_DATE_COLUMNS で取得する列 */
export interface DbWhDate {
  id: number;
  year: number;
  event: string;
  description: string | null;
  chapter: string; // wh_chapters.key
  tags: string[] | null; // wh_tags.key[]
  theme: string; // 4値
  wiki_url: string | null;
  is_published: boolean;
}

export function mapProfileFromDb(row: DbProfile): Profile {
  return {
    id: row.id,
    username: row.username ?? "User",
    avatarUrl: row.avatar_url,
    theme: row.theme,
    totalAnswered: row.total_answered,
    totalCorrect: row.total_correct,
    streakCurrent: row.streak_current,
    streakBest: row.streak_best,
    lastPlayedAt: row.last_played_at,
    rankPoints: row.rank_points,
  };
}

export function mapWhDateToQuizItem(row: DbWhDate): HistoryQuizItem | null {
  if (row.year === null || row.year === undefined) return null;

  return {
    id: String(row.id),
    event: row.event,
    year: row.year,
    is_bc: row.year < 0,
    chapter: CHAPTER_LABEL[row.chapter] ?? row.chapter,
    period: getPeriodFromYear(row.year),
    tags: row.tags ?? [],
    theme: isQuestionTheme(row.theme) ? row.theme : undefined,
    description: row.description ?? undefined,
  };
}

/** wh_dates の数値IDのみ成績を保存できる（モックの "wh-1" などは対象外） */
export function isPersistableQuestionId(id: string): boolean {
  return /^\d+$/.test(id);
}
