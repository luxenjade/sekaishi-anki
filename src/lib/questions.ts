import { supabase, isSupabaseConfigured } from "./supabase";
import { mockHistoryData } from "../data/mockEvents";
import {
  DB_WH_DATE_COLUMNS,
  mapWhDateToQuizItem,
  type DbWhDate,
} from "./database";
import { CHAPTERS } from "./taxonomy";
import { PERIODS } from "./periods";
import type { HistoryQuizItem, QuizMode } from "../types/quiz";

const PAGE_SIZE = 1000;
const MAX_PAGES = 50; // 無限ループ防止（最大5万件）

export type FallbackReason = "not-configured" | "empty" | "error";

export interface FetchQuestionsResult {
  items: HistoryQuizItem[];
  source: "supabase" | "mock";
  /** モックに切り替わった理由（source === "mock" のときのみ） */
  fallbackReason?: FallbackReason;
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

    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE;
      const { data, error } = await supabase
        .from("wh_dates")
        .select(DB_WH_DATE_COLUMNS)
        .eq("is_published", true)
        .order("year", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;
      if (!data?.length) break;

      allRows.push(...(data as unknown as DbWhDate[]));
      if (data.length < PAGE_SIZE) break;
    }

    const items = allRows
      .map((row) => mapWhDateToQuizItem(row))
      .filter((item): item is HistoryQuizItem => item !== null);

    if (items.length === 0) {
      console.warn("wh_dates に公開済みの問題がありません — モックデータを使用します");
      return { items: mockHistoryData, source: "mock", fallbackReason: "empty" };
    }

    return { items, source: "supabase" };
  } catch (err) {
    console.error("Failed to fetch wh_dates:", err);
    return { items: mockHistoryData, source: "mock", fallbackReason: "error" };
  }
}

/** 同じ年の公開済み問題（提出時の重複警告用） */
export async function fetchPublishedByYear(
  year: number,
): Promise<{ id: string; event: string }[]> {
  if (!isSupabaseConfigured()) {
    return mockHistoryData
      .filter((item) => item.year === year)
      .map((item) => ({ id: item.id, event: item.event }));
  }

  const { data, error } = await supabase
    .from("wh_dates")
    .select("id, event")
    .eq("year", year)
    .eq("is_published", true);

  if (error || !data) return [];
  return (data as { id: number; event: string }[]).map((row) => ({
    id: String(row.id),
    event: row.event,
  }));
}

/** 出題範囲セレクトの選択肢をプールから動的生成（章・時代区分は定義順に並べる） */
export function getRangeOptions(
  pool: HistoryQuizItem[],
  mode: QuizMode,
): string[] {
  const key = mode === "event-to-year" ? "chapter" : "period";
  const present = new Set(pool.map((item) => item[key]));

  const order: string[] =
    mode === "event-to-year"
      ? CHAPTERS.map((c) => c.label)
      : [...PERIODS];

  const ordered = order.filter((label) => present.has(label));
  const rest = [...present].filter((label) => !order.includes(label)).sort();
  return [...ordered, ...rest];
}
