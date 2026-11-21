// 世界史年代クイズの中核型定義

export type QuizMode = "event-to-year" | "year-to-event";

export type QuizScreen = "start" | "quiz" | "result";

export type AppTab = "quiz" | "stats" | "submit" | "settings" | "admin";

/** wh_dates.theme（4値の主題軸） */
export type QuestionTheme =
  | "politics_war"
  | "economy_society"
  | "religion"
  | "culture_science";

export interface HistoryQuizItem {
  id: string;
  event: string;
  year: number; // 紀元前は負の値 (例: -221)
  is_bc: boolean; // 紀元前フラグ
  chapter: string; // 出来事→年号の分類（章の表示ラベル）
  period: string; // 年号→出来事の分類（時代区分）
  tags?: string[]; // 国・地域などの横断タグ（wh_tags.key）
  theme?: QuestionTheme;
  description?: string;
  /** @deprecated 旧スキーマ。mockEvents.ts の移行が終わったら削除する */
  region?: string;
  /** @deprecated 旧スキーマ。mockEvents.ts の移行が終わったら削除する */
  field?: string;
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

export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  theme: "light" | "dark" | "system";
  totalAnswered: number;
  totalCorrect: number;
  streakCurrent: number;
  streakBest: number;
  lastPlayedAt: string | null;
  rankPoints: number;
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

/** wh_submissions の1行（オフライン時はローカル生成） */
export interface Submission {
  id: number | string;
  year: number;
  event: string;
  description: string | null;
  wiki_url: string | null;
  status: SubmissionStatus;
  reviewer_note?: string | null;
  created_at: string;
}
