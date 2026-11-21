import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mapWhDateToQuizItem, type DbWhDate } from "../lib/database";
import { CHAPTER_LABEL } from "../lib/taxonomy";
import type { HistoryQuizItem, Submission } from "../types/quiz";

/** 章ラベル → 解答数・正解数 */
export type ChapterStats = Record<string, { attempts: number; correct: number }>;

const KEYS = {
  reviews: "sekaishi-reviews",
  submissions: "sekaishi-submissions",
  chapterStats: "sekaishi-chapter-stats",
} as const;

// 旧バージョンが使っていたキー（クリア時に一緒に消す）
const LEGACY_KEYS = [
  "sekaishi-custom-pool",
  "sekaishi-history",
  "sekaishi-category-stats",
];

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 容量超過などは無視 */
  }
}

/**
 * ログインユーザーの復習キュー・提出履歴・章別成績を保持する。
 * オンライン: DB（user_question_stats / wh_submissions / my_chapter_stats）が正。
 * オフライン（デモ）: localStorage が正。
 */
export function useUserData(userId: string | null, isOfflineMode: boolean) {
  const [reviewItems, setReviewItemsState] = useState<HistoryQuizItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [chapterStats, setChapterStatsState] = useState<ChapterStats>({});

  const setReviewItems = useCallback(
    (updater: (prev: HistoryQuizItem[]) => HistoryQuizItem[]) => {
      setReviewItemsState((prev) => {
        const next = updater(prev);
        writeLocal(KEYS.reviews, next);
        return next;
      });
    },
    [],
  );

  const setChapterStats = useCallback(
    (updater: (prev: ChapterStats) => ChapterStats) => {
      setChapterStatsState((prev) => {
        const next = updater(prev);
        writeLocal(KEYS.chapterStats, next);
        return next;
      });
    },
    [],
  );

  const loadReviews = useCallback(async () => {
    if (!userId) return;
    if (isOfflineMode) {
      setReviewItemsState(readLocal<HistoryQuizItem[]>(KEYS.reviews, []));
      return;
    }

    // 復習キュー = 直近の解答が不正解の問題
    const { data, error } = await supabase
      .from("user_question_stats")
      .select("question_id, wh_dates(*)")
      .eq("user_id", userId)
      .eq("last_correct", false)
      .order("last_answered_at", { ascending: false });

    if (error) {
      console.error("Error loading review items:", error.message);
      return;
    }

    type Row = { wh_dates: DbWhDate | DbWhDate[] | null };
    const items = ((data ?? []) as unknown as Row[])
      .map((r) => (Array.isArray(r.wh_dates) ? r.wh_dates[0] : r.wh_dates))
      .filter((d): d is DbWhDate => Boolean(d))
      .map((d) => mapWhDateToQuizItem(d))
      .filter((item): item is HistoryQuizItem => item !== null);

    setReviewItemsState(items);
    writeLocal(KEYS.reviews, items);
  }, [userId, isOfflineMode]);

  const loadSubmissions = useCallback(async () => {
    if (!userId) return;
    if (isOfflineMode) {
      setSubmissions(readLocal<Submission[]>(KEYS.submissions, []));
      return;
    }

    const { data, error } = await supabase
      .from("wh_submissions")
      .select("id, year, event, description, wiki_url, status, reviewer_note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading submissions:", error.message);
      return;
    }
    setSubmissions((data ?? []) as Submission[]);
  }, [userId, isOfflineMode]);

  const loadChapterStats = useCallback(async () => {
    if (!userId) return;
    if (isOfflineMode) {
      setChapterStatsState(readLocal<ChapterStats>(KEYS.chapterStats, {}));
      return;
    }

    const { data, error } = await supabase
      .from("my_chapter_stats")
      .select("chapter, attempts, correct");

    if (error) {
      console.error("Error loading chapter stats:", error.message);
      return;
    }

    type Row = {
      chapter: string;
      attempts: number | string;
      correct: number | string;
    };
    const next: ChapterStats = {};
    for (const row of (data ?? []) as Row[]) {
      next[CHAPTER_LABEL[row.chapter] ?? row.chapter] = {
        attempts: Number(row.attempts),
        correct: Number(row.correct),
      };
    }
    setChapterStatsState(next);
  }, [userId, isOfflineMode]);

  // ログイン状態が変わったら読み直す
  useEffect(() => {
    if (!userId) {
      setReviewItemsState([]);
      setSubmissions([]);
      setChapterStatsState({});
      return;
    }
    void loadReviews();
    void loadSubmissions();
    void loadChapterStats();
  }, [userId, loadReviews, loadSubmissions, loadChapterStats]);

  /** オフライン用: セッション結果を復習キュー・章別成績へ反映（DBと同じく「最後の解答」で判定） */
  const applyLocalResults = useCallback(
    (items: HistoryQuizItem[], correctIds: Set<string>) => {
      setReviewItems((prev) => {
        const kept = prev.filter((p) => !correctIds.has(p.id));
        const keptIds = new Set(kept.map((p) => p.id));
        const added = items.filter(
          (i) => !correctIds.has(i.id) && !keptIds.has(i.id),
        );
        return [...kept, ...added];
      });
      setChapterStats((prev) => {
        const next: ChapterStats = { ...prev };
        for (const item of items) {
          const cur = next[item.chapter] ?? { attempts: 0, correct: 0 };
          next[item.chapter] = {
            attempts: cur.attempts + 1,
            correct: cur.correct + (correctIds.has(item.id) ? 1 : 0),
          };
        }
        return next;
      });
    },
    [setReviewItems, setChapterStats],
  );

  /** オフライン用: 提出履歴にローカルレコードを追加 */
  const addLocalSubmission = useCallback((submission: Submission) => {
    setSubmissions((prev) => {
      const next = [submission, ...prev];
      writeLocal(KEYS.submissions, next);
      return next;
    });
  }, []);

  /** ローカルのキャッシュを全消去（学習データのリセット用） */
  const clearLocalData = useCallback(() => {
    for (const key of [...Object.values(KEYS), ...LEGACY_KEYS]) {
      localStorage.removeItem(key);
    }
    setReviewItemsState([]);
    setSubmissions([]);
    setChapterStatsState({});
  }, []);

  return {
    reviewItems,
    submissions,
    chapterStats,
    setReviewItems,
    applyLocalResults,
    addLocalSubmission,
    clearLocalData,
    reloadReviews: loadReviews,
    reloadSubmissions: loadSubmissions,
    reloadChapterStats: loadChapterStats,
  };
}
