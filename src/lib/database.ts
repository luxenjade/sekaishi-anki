import type { Field, HistoryQuizItem, Profile, QuizMode, Region } from "../types/quiz";
import { getPeriodFromYear } from "./periods";

export function quizModeToDb(mode: QuizMode): string {
  return mode.replace(/-/g, "_");
}

export function quizModeFromDb(mode: string): QuizMode {
  return mode.replace(/_/g, "-") as QuizMode;
}

/** wh_regions.key → 表示ラベル */
export const REGION_LABELS: Record<string, string> = {
  "east-asia": "東アジア",
  "central-asia": "中央アジア",
  "south-asia": "南アジア",
  "middle-east": "中東",
  europe: "ヨーロッパ",
  africa: "アフリカ",
  americas: "アメリカ大陸",
  oceania: "オセアニア",
};

/** DB の日本語 field → アプリ内部 Field */
const FIELD_FROM_DB: Record<string, Field> = {
  政治: "politics",
  経済: "economy",
  "文化・宗教": "culture-religion",
  社会: "social",
  "外交・戦争": "war-diplomacy",
};

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

/** supabase.sql の wh_dates スキーマ */
export interface DbWhDate {
  id: number;
  year: number | null;
  date_type: string;
  full_date: string | null;
  event: string;
  description: string | null;
  region: string[] | null;
  field: string | null;
  memo: string | null;
  wiki_score: number | null;
  created_at: string | null;
  updated_at: string | null;
  year_end: number | null;
  record_type: string;
  wiki_url: string | null;
}

export interface DbSubmission {
  id: number;
  user_id: string;
  year: number;
  year_end: number | null;
  event: string;
  description: string | null;
  region: string[] | null;
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

function mapRegionKey(key: string): Region | undefined {
  if (key in REGION_LABELS) return key as Region;
  return undefined;
}

function regionLabelFromKeys(keys: string[] | null): string {
  if (!keys?.length) return "未分類";
  return REGION_LABELS[keys[0]] ?? keys[0];
}

function mapFieldFromDb(field: string | null): Field | undefined {
  if (!field) return undefined;
  return FIELD_FROM_DB[field];
}

export function mapWhDateToQuizItem(row: DbWhDate): HistoryQuizItem | null {
  if (row.year === null) return null;

  const regionKeys = row.region ?? [];
  const regionLabel = regionLabelFromKeys(regionKeys);
  const primaryRegion = regionKeys.length
    ? mapRegionKey(regionKeys[0])
    : undefined;

  return {
    id: String(row.id),
    event: row.event,
    year: row.year,
    is_bc: row.year < 0,
    // chapter 列がないため地域ラベルを範囲フィルタ用に流用
    chapter: regionLabel,
    period: getPeriodFromYear(row.year),
    region: primaryRegion,
    field: mapFieldFromDb(row.field),
    description: row.description ?? undefined,
  };
}

/** Numeric wh_dates id only — non-numeric ids are not stored in review_items */
export function isPersistableQuestionId(id: string): boolean {
  return /^\d+$/.test(id);
}
