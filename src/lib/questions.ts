import { supabase, isSupabaseConfigured } from "./supabase";
import { mockHistoryData } from "../data/mockEvents";
import { mapWhDateToQuizItem, type DbWhDate } from "./database";
import type { HistoryQuizItem, QuizMode } from "../types/quiz";

const PAGE_SIZE = 1000;

export async function fetchQuestions(): Promise<{
  items: HistoryQuizItem[];
  source: "supabase" | "mock";
}> {
  if (!isSupabaseConfigured()) {
    return { items: mockHistoryData, source: "mock" };
  }

  try {
    const allRows: DbWhDate[] = [];
    let from = 0;

    for (;;) {
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
      console.warn("wh_dates is empty — falling back to mock data");
      return { items: mockHistoryData, source: "mock" };
    }

    return { items, source: "supabase" };
  } catch (err) {
    console.error("Failed to fetch wh_dates:", err);
    return { items: mockHistoryData, source: "mock" };
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
      "id, year, date_type, event, description, region, field, year_end, record_type",
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

/** 出題範囲セレクトの選択肢をプールから動的生成 */
export function getRangeOptions(
  pool: HistoryQuizItem[],
  mode: QuizMode,
): string[] {
  const key = mode === "event-to-year" ? "chapter" : "period";
  return Array.from(new Set(pool.map((item) => item[key]))).sort();
}
