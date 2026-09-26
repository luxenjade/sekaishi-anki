import { supabase, isSupabaseConfigured } from "./supabase";
import { mockHistoryData } from "../data/mockEvents";
import { mapWhDateToQuizItem, type DbWhDate } from "./database";
import { CHAPTERS } from "./chapters";
import { PERIODS } from "./periods";
import type { HistoryQuizItem, QuizMode } from "../types/quiz";

const PAGE_SIZE = 1000;
// 異常系（想定外に大量の行が返り続ける等）で無限ループしないための安全上限。
// wh_dates が現実的な規模を大きく超えた場合はここで打ち切り、警告を出す。
const MAX_PAGES = 50; // PAGE_SIZE(1000) * 50 = 最大5万件まで取得

export type QuestionSource = "supabase" | "mock";

/**
 * mock データへフォールバックした理由。
 * - "not-configured": Supabase の環境変数が設定されていない（意図的なデモモード）
 * - "empty": Supabase は設定済みだが wh_dates が空だった（想定外・要調査）
 * - "error": Supabase への問い合わせ自体が失敗した（想定外・要調査）
 * - null: フォールバックしていない（source === "supabase"）
 */
export type FallbackReason = "not-configured" | "empty" | "error" | null;

export interface FetchQuestionsResult {
  items: HistoryQuizItem[];
  source: QuestionSource;
  fallbackReason: FallbackReason;
}

export async function fetchQuestions(): Promise<FetchQuestionsResult> {
  if (!isSupabaseConfigured()) {
    return {
      items: mockHistoryData,
      source: "mock",
      fallbackReason: "not-configured",
    };
  }

  try {
    const allRows: DbWhDate[] = [];
    let from = 0;
    let page = 0;

    for (;;) {
      page += 1;
      if (page > MAX_PAGES) {
        console.warn(
          `wh_dates fetch aborted after ${MAX_PAGES} pages (${allRows.length} rows) — hit MAX_PAGES safety limit.`,
        );
        break;
      }

      const { data, error } = await supabase
        .from("wh_dates")
        .select(
          "id, year, date_type, event, description, region, field, year_end, record_type, chapter, tags",
        )
        .eq("record_type", "event")
        .not("year", "is", null)
        .order("year", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;
      if (!data?.length) break;

      allRows.push(...(data as DbWhDate[]));
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    const items = allRows
      .map(mapWhDateToQuizItem)
      .filter((item): item is HistoryQuizItem => item !== null);

    if (items.length === 0) {
      // Supabase は設定されているのにデータが無い = 本番のはずが空、はサイレントに
      // 隠すべきではないバグ状態。呼び出し側（App.tsx）で明示的にユーザーへ知らせる。
      console.warn("wh_dates is empty — falling back to mock data");
      return {
        items: mockHistoryData,
        source: "mock",
        fallbackReason: "empty",
      };
    }

    return { items, source: "supabase", fallbackReason: null };
  } catch (err) {
    console.error("Failed to fetch wh_dates:", err);
    return { items: mockHistoryData, source: "mock", fallbackReason: "error" };
  }
}

export async function fetchQuestionsByYear(
  year: number,
): Promise<HistoryQuizItem[]> {
  if (!isSupabaseConfigured()) {
    return mockHistoryData.filter((item) => item.year === year);
  }

  const { data, error } = await supabase
    .from("wh_dates")
    .select(
      "id, year, date_type, event, description, region, field, year_end, record_type, chapter, tags",
    )
    .eq("year", year)
    .eq("record_type", "event");

  if (error || !data?.length) {
    return mockHistoryData.filter((item) => item.year === year);
  }

  return (data as DbWhDate[])
    .map(mapWhDateToQuizItem)
    .filter((item): item is HistoryQuizItem => item !== null);
}

/**
 * 出題範囲セレクトの選択肢をプールから動的生成する。
 * chapter は「第1章」のような文字列の辞書順ソートだと 第10章 が 第2章 より
 * 前に来てしまう（旧実装のバグ）ため、カリキュラム順の CHAPTERS / PERIODS を
 * 正として並べ、プールに存在するものだけを残す。
 */
export function getRangeOptions(
  pool: HistoryQuizItem[],
  mode: QuizMode,
): string[] {
  const key = mode === "event-to-year" ? "chapter" : "period";
  const present = new Set(pool.map((item) => item[key]));
  const canonicalOrder: readonly string[] =
    mode === "event-to-year" ? CHAPTERS : PERIODS;

  const ordered = canonicalOrder.filter((v) => present.has(v));
  // カリキュラム順リストに無い値（分類保留など）は末尾にアルファベット順で追加
  const extras = Array.from(present)
    .filter((v) => !canonicalOrder.includes(v))
    .sort();
  return [...ordered, ...extras];
}
