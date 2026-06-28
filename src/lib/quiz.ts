import type { HistoryQuizItem, QuizMode } from "../types/quiz";

/** シャッフル (Fisher-Yates) */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 年号を表示用にフォーマット (-221 → "前221年", 1789 → "1789年") */
export function formatYear(year: number): string {
  if (year < 0) return `前${Math.abs(year)}年`;
  return `${year}年`;
}

/** 入力文字列を年号数値にパース。不正な文字列は null */
export function parseYearInput(input: string): number | null {
  const trimmed = input.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  if (Number.isNaN(n)) return null;
  return n;
}

/** モードに応じて対象範囲のアイテムを抽出 */
export function filterByRange(
  items: HistoryQuizItem[],
  mode: QuizMode,
  range: string,
): HistoryQuizItem[] {
  if (range === "all") return items;
  if (mode === "event-to-year") {
    return items.filter((item) => item.chapter === range);
  }
  return items.filter((item) => item.period === range);
}

/** 4択の選択肢を生成（同じ period から3件のダミー） */
export function buildChoiceOptions(
  current: HistoryQuizItem,
  pool: HistoryQuizItem[],
  count = 4,
): string[] {
  const correctEvent = current.event;
  const samePeriod = pool.filter(
    (x) => x.period === current.period && x.event !== correctEvent,
  );
  const dummies = shuffleArray(samePeriod)
    .slice(0, count - 1)
    .map((x) => x.event);
  return shuffleArray([correctEvent, ...dummies]);
}

/** 出題数を反映した最終的な問題配列を返す */
export function buildQuizSet(
  pool: HistoryQuizItem[],
  count: number | "all",
): HistoryQuizItem[] {
  const shuffled = shuffleArray(pool);
  if (count === "all") return shuffled;
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** 選択肢インデックスからラベルを返す(A, B, C, D) */
export function choiceLabel(index: number): string {
  return String.fromCharCode(65 + index);
}
