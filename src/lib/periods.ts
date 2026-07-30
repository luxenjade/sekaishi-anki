/** 年号から時代区分を導出（wh_dates に period 列がないためクライアント側で算出） */
export const PERIODS = [
  "紀元前",
  "1〜1000年",
  "1001〜1500年",
  "1501〜1700年",
  "1701〜1800年",
  "1801〜1900年",
  "1901〜1945年",
  "1946〜1989年",
  "1990年〜",
] as const;

export type Period = (typeof PERIODS)[number];

export function getPeriodFromYear(year: number): Period {
  if (year < 0) return "紀元前";
  if (year <= 1000) return "1〜1000年";
  if (year <= 1500) return "1001〜1500年";
  if (year <= 1700) return "1501〜1700年";
  if (year <= 1800) return "1701〜1800年";
  if (year <= 1900) return "1801〜1900年";
  if (year <= 1945) return "1901〜1945年";
  if (year <= 1989) return "1946〜1989年";
  return "1990年〜";
}
