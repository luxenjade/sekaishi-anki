/**
 * テーマ別カテゴリー。DBの CHECK 制約もこの英語キーに揃える
 * （旧仕様は DB側=日本語, アプリ側=英語 の2重管理で submit-mappers.ts に
 * 変換レイヤーが必要だった。今後は英語キーで一本化し、日本語ラベルは
 * 表示側だけが持つ）。
 */
export const THEMES = [
  { key: "politics_war", label: "政治・戦争・外交" },
  { key: "economy_society", label: "社会・経済" },
  { key: "religion", label: "宗教" },
  { key: "culture_science", label: "文化・思想・科学" },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];

export function themeLabel(key: string): string {
  return THEMES.find((t) => t.key === key)?.label ?? key;
}

export function isKnownTheme(value: string): value is ThemeKey {
  return THEMES.some((t) => t.key === value);
}
