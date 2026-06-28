// 世界史年代クイズの中核型定義

export type QuizMode = "event-to-year" | "year-to-event";

export type QuizScreen = "start" | "quiz" | "result";

export type AppTab = "quiz" | "stats" | "submit" | "settings";

export type StatsView = "summary" | "review-cards";

export type Region =
  | "east-asia"
  | "central-asia"
  | "south-asia"
  | "middle-east"
  | "europe"
  | "africa"
  | "americas"
  | "oceania";

export type Field =
  | "politics"
  | "economy"
  | "culture-religion"
  | "social"
  | "war-diplomacy"
  | "science-technology";

export interface HistoryQuizItem {
  id: string;
  event: string;
  year: number; // 紀元前は負の値 (例: -221)
  is_bc: boolean; // 紀元前フラグ
  chapter: string; // 出来事→年号の分類（章）
  period: string; // 年号→出来事の分類（時代区分）
  region?: Region; // 地域（idea.md の wh_regions に対応）
  field?: Field; // 分野
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
  region: Region[];
  field?: Field | null;
  status?: "pending" | "approved" | "rejected";
}
