// 世界史年代クイズの中核型定義

export type QuizMode = "event-to-year" | "year-to-event";

export type QuizScreen = "start" | "quiz" | "result";

export type AppTab = "quiz" | "stats" | "submit" | "settings";

export type StatsView = "summary" | "review-cards";

/**
 * @deprecated 2026-09のカテゴリー再設計で撤去対象。
 * 大陸区分は chapter（東アジア王朝／南アジア王朝など）が実質的に内包しており、
 * region と chapter の意味が衝突する問題を起こしていたため、今後は使わない。
 * DBの region 列・wh_regions テーブル自体はまだ残っているが、
 * アプリからは参照・書き込みしない。既存データ移行のためだけに型を残す。
 */
export type Region =
  | "east-asia"
  | "central-asia"
  | "south-asia"
  | "middle-east"
  | "europe"
  | "africa"
  | "americas"
  | "oceania";

/**
 * テーマ別分類。値は src/lib/themes.ts の THEMES と一致させること
 * （DBのCHECK制約も同じ英語キーに揃えている）。
 */
export type Field =
  "politics_war" | "economy_society" | "religion" | "culture_science";

export interface HistoryQuizItem {
  id: string;
  event: string;
  year: number; // 紀元前は負の値 (例: -221)
  is_bc: boolean; // 紀元前フラグ
  /**
   * 出来事→年号モードの出題範囲。src/lib/chapters.ts の Chapter
   * （またはUNCLASSIFIED_CHAPTER）のいずれか。
   * データソース（mock / Supabase）を問わず同じ意味を持つ。
   */
  chapter: string;
  period: string; // 年号→出来事モードの出題範囲（時代区分）
  /** @deprecated 撤去予定。互換のため一時的に残す */
  region?: Region;
  field?: Field;
  /** 国・主体レベルの横断タグ（#なしのスラッグ配列）。例: ["france", "japan"] */
  tags?: string[];
  description?: string;
}

export interface QuizMistake {
  item: HistoryQuizItem;
  userAnswer: string;
  correctLabel: string;
}

export interface QuizResult {
  score: number;
  total: number;
  mistakes: QuizMistake[];
}

export interface ReviewItem {
  id: string;
  questionId: string;
  addedAt: string;
  reviewCount: number;
  lastReviewedAt: string | null;
  // 結合済みデータ
  item?: HistoryQuizItem;
}

export interface FieldStat {
  field: Field;
  answered: number;
  correct: number;
}

export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  quizMode: QuizMode;
  theme: "light" | "dark" | "system";
  totalAnswered: number;
  totalCorrect: number;
  streakCurrent: number;
  streakBest: number;
  lastPlayedAt: string | null;
  rankPoints: number;
}

export interface Submission {
  id?: string;
  year: number;
  yearEnd?: number | null;
  event: string;
  description?: string;
  chapter?: string;
  tags?: string[];
  field?: Field | null;
  status?: "pending" | "approved" | "rejected";
}
