import { supabase, isSupabaseConfigured } from "./supabase";
import { mapWhDateToQuizItem, type DbWhDate } from "./database";
import type { HistoryQuizItem, QuizMode } from "../types/quiz";

const PAGE_SIZE = 1000;
// 異常系（想定外に大量の行が返り続ける等）で無限ループしないための安全上限。
const MAX_PAGES = 50; // PAGE_SIZE(1000) * 50 = 最大5万件まで取得

export type QuestionsLoadError = "not-configured" | "empty" | "error" | null;

export interface FetchQuestionsResult {
  items: HistoryQuizItem[];
  error: QuestionsLoadError;
}

export async function fetchQuestions(): Promise<FetchQuestionsResult> {
  if (!isSupabaseConfigured()) {
    return { items: [], error: "not-configured" };
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
          "id, year, date_type, event, description, region, field, year_end, record_type",
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
      console.warn("wh_dates is empty");
      return { items: [], error: "empty" };
    }

    return { items, error: null };
  } catch (err) {
    console.error("Failed to fetch wh_dates:", err);
    return { items: [], error: "error" };
  }
}

export async function fetchQuestionsByYear(
  year: number,
): Promise<HistoryQuizItem[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("wh_dates")
    .select(
      "id, year, date_type, event, description, region, field, year_end, record_type",
    )
    .eq("year", year)
    .eq("record_type", "event");

  if (error || !data?.length) return [];

  return (data as DbWhDate[])
    .map(mapWhDateToQuizItem)
    .filter((item): item is HistoryQuizItem => item !== null);
}

/** 出題範囲セレクトの選択肢をプールから動的生成 */
export function getRangeOptions(
  pool: HistoryQuizItem[],
  mode: QuizMode,
): string[] {
  const key = mode === "event-to-year" ? "chapter" : "period";
  return Array.from(new Set(pool.map((item) => item[key]))).sort();
}
