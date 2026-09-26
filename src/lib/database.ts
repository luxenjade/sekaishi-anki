import type { Field, HistoryQuizItem, Profile, QuizMode } from "../types/quiz";
import { getPeriodFromYear } from "./periods";
import { UNCLASSIFIED_CHAPTER } from "./chapters";
import { isKnownTheme } from "./themes";
import { REGION_LABELS } from "./regions-legacy";

export function quizModeToDb(mode: QuizMode): string {
  return mode.replace(/-/g, "_");
}

export function quizModeFromDb(mode: string): QuizMode {
  return mode.replace(/_/g, "-") as QuizMode;
}

export interface DbProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  quiz_mode: string;
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

/** supabase.sql / カテゴリー再設計マイグレーション適用後の wh_dates スキーマ */
export interface DbWhDate {
  id: number;
  year: number | null;
  date_type: string;
  full_date: string | null;
  event: string;
  description: string | null;
  /** @deprecated chapter/tags に置き換え済み。移行期間中のフォールバック用にのみ参照 */
  region: string[] | null;
  /** テーマキー（politics_war 等）。英語キーでDBに保存されている想定 */
  field: string | null;
  memo: string | null;
  wiki_score: number | null;
  created_at: string | null;
  updated_at: string | null;
  year_end: number | null;
  record_type: string;
  wiki_url: string | null;
  /** 新設: カテゴリー再設計で追加した列。src/lib/chapters.ts の Chapter のいずれか */
  chapter: string | null;
  /** 新設: 国・主体タグのスラッグ配列 */
  tags: string[] | null;
}

export interface DbSubmission {
  id: number;
  user_id: string;
  year: number;
  year_end: number | null;
  event: string;
  description: string | null;
  chapter: string | null;
  tags: string[] | null;
  field: string | null;
  status: "pending" | "approved" | "rejected";
  reviewer_note: string | null;
  created_at: string;
}

export function mapProfileFromDb(row: DbProfile): Profile {
  return {
    id: row.id,
    username: row.username ?? "User",
    avatarUrl: row.avatar_url,
    quizMode: quizModeFromDb(row.quiz_mode),
    theme: row.theme,
    totalAnswered: row.total_answered,
    totalCorrect: row.total_correct,
    streakCurrent: row.streak_current,
    streakBest: row.streak_best,
    lastPlayedAt: row.last_played_at,
    rankPoints: row.rank_points,
  };
}

function mapFieldFromDb(field: string | null): Field | undefined {
  if (!field) return undefined;
  // DBは英語キー（politics_war 等）で保存されている前提。
  // 万一未知の値が来た場合は黙って誤分類にせず undefined にする
  // （以前の実装は未対応値を全部「社会」に丸めてしまい、
  //  ユーザーが選んだ分類と違う結果になるバグがあった）。
  return isKnownTheme(field) ? (field as Field) : undefined;
}

export function mapWhDateToQuizItem(row: DbWhDate): HistoryQuizItem | null {
  if (row.year === null) return null;

  // chapter 列が未バックフィルの行に対する暫定フォールバック。
  // chapter が入っていればそれを正として使う（12分類に無い値、例えば
  // UNCLASSIFIED_CHAPTER が入っていてもそのまま尊重する）。
  // 移行期間中、まだ chapter が空の行だけ region から機械的に推測する。
  const chapter = row.chapter
    ? row.chapter
    : row.region?.length
      ? (REGION_LABELS[row.region[0]] ?? UNCLASSIFIED_CHAPTER)
      : UNCLASSIFIED_CHAPTER;

  return {
    id: String(row.id),
    event: row.event,
    year: row.year,
    is_bc: row.year < 0,
    chapter,
    period: getPeriodFromYear(row.year),
    tags: row.tags ?? undefined,
    field: mapFieldFromDb(row.field),
    description: row.description ?? undefined,
  };
}

/** Numeric wh_dates id only — mock ids like "wh-1" are not stored in review_items */
export function isPersistableQuestionId(id: string): boolean {
  return /^\d+$/.test(id);
}
