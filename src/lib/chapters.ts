/**
 * 出題範囲の「章」分類（カテゴリー再設計・2026-09）。
 *
 * 旧仕様の問題点だった「モックデータの chapter は教科書的な章立て、
 * Supabase側の chapter は region を流用した代物」という意味のズレを解消し、
 * データソースに関わらず同じ意味を持つ単一の分類軸として扱う。
 *
 * 国・主体レベルの横断軸は tags.ts 側で別に持つ（例: #france, #japan）。
 * テーマ別の軸は themes.ts 側で持つ（politics_war / economy_society / ...）。
 */
export const CHAPTERS = [
  "古代オリエント・地中海世界",
  "中世ヨーロッパ",
  "近代ヨーロッパ（大航海時代〜ウィーン会議）",
  "19世紀の世界（ナショナリズム中心）",
  "2つの大戦",
  "冷戦",
  "現代世界（冷戦後）",
  "イスラーム",
  "東アジア（中国・朝鮮・モンゴル）王朝",
  "南アジア（インド）王朝",
  "東南アジア王朝",
  "日本史",
] as const;

export type Chapter = (typeof CHAPTERS)[number];

/**
 * 上記12分類のどれにも当てはまらない項目（南北アメリカ大陸の先コロンブス期文明、
 * サブサハラアフリカの諸王国など）を一時的に置くための保留ラベル。
 * 正式な13番目の章にするか、対象外として削除するかは要相談。
 * CHAPTERS には含めない = 出題範囲セレクトの選択肢には出てこない。
 */
export const UNCLASSIFIED_CHAPTER = "分類保留（要相談）" as const;

export function isKnownChapter(value: string): value is Chapter {
  return (CHAPTERS as readonly string[]).includes(value);
}
