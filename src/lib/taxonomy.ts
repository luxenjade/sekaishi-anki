import type { QuestionTheme } from "../types/quiz";

/**
 * 分類マスターの定数。
 * supabase/migrations/20261120000000_rebuild_schema.sql の wh_chapters シードと一致させること。
 * （タグ wh_tags は増減しやすいので、必要な画面で DB から取得する）
 */
export const CHAPTERS: { key: string; label: string }[] = [
  { key: "ancient-mediterranean", label: "古代オリエント・地中海世界" },
  { key: "medieval-europe", label: "中世ヨーロッパ" },
  {
    key: "early-modern-europe",
    label: "近代ヨーロッパ（大航海時代〜ウィーン会議）",
  },
  { key: "nineteenth-century", label: "19世紀の世界（ナショナリズム中心）" },
  { key: "world-wars", label: "2つの大戦" },
  { key: "cold-war", label: "冷戦" },
  { key: "contemporary", label: "現代世界（冷戦後）" },
  { key: "islam", label: "イスラーム" },
  { key: "east-asia", label: "東アジア（中国・朝鮮・モンゴル）王朝" },
  { key: "south-asia", label: "南アジア（インド）王朝" },
  { key: "southeast-asia", label: "東南アジア王朝" },
  { key: "japan", label: "日本史" },
];

export const CHAPTER_LABEL: Record<string, string> = Object.fromEntries(
  CHAPTERS.map((c) => [c.key, c.label]),
);

export const THEMES: { key: QuestionTheme; label: string }[] = [
  { key: "politics_war", label: "政治・戦争" },
  { key: "economy_society", label: "経済・社会" },
  { key: "religion", label: "宗教" },
  { key: "culture_science", label: "文化・科学" },
];

export const THEME_LABEL: Record<string, string> = Object.fromEntries(
  THEMES.map((t) => [t.key, t.label]),
);

export function isQuestionTheme(value: string): value is QuestionTheme {
  return THEMES.some((t) => t.key === value);
}

/**
 * タグの表示名。wh_tags のシード（label）と一致させること。
 * 未登録のキーは、キーをそのまま表示する。
 */
export const TAG_LABEL: Record<string, string> = {
  france: "フランス",
  britain: "イギリス",
  germany: "ドイツ",
  italy: "イタリア",
  spain: "スペイン",
  russia: "ロシア",
  usa: "アメリカ",
  china: "中国",
  korea: "朝鮮",
  mongol: "モンゴル",
  japan: "日本",
  india: "インド",
  ottoman: "オスマン帝国",
  persia: "ペルシア",
  rome: "ローマ",
  greece: "ギリシア",
  egypt: "エジプト",
  byzantium: "ビザンツ帝国",
  hre: "神聖ローマ帝国",
};

export function tagLabel(key: string): string {
  return TAG_LABEL[key] ?? key;
}
