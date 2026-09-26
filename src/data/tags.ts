/**
 * 国・主体レベルの横断タグ。#france, #japan のように使う。
 *
 * 表記ゆれ（#France / #france / #フランス）を防ぐため、主要な国・帝国だけは
 * ここで key/label を正規化しておく。マイナーな話題まで全部事前定義する
 * 必要はなく、コアタグに無いものは投稿フォームで自由入力を許可し、
 * 管理者承認時に正規化する運用を想定（wh_tags テーブルに追記していく）。
 *
 * このファイルの内容は supabase/migrations の wh_tags シードと一致させること。
 */
export interface TagDef {
  key: string; // #なしのスラッグ。小文字英数字とハイフンのみ
  label: string; // UI表示用の日本語ラベル
}

export const CORE_TAGS: TagDef[] = [
  { key: "china", label: "中国" },
  { key: "japan", label: "日本" },
  { key: "korea", label: "朝鮮・韓国" },
  { key: "mongolia", label: "モンゴル" },
  { key: "india", label: "インド" },
  { key: "ottoman", label: "オスマン帝国" },
  { key: "persia", label: "ペルシア" },
  { key: "egypt", label: "エジプト" },
  { key: "greece", label: "ギリシア" },
  { key: "rome", label: "ローマ" },
  { key: "france", label: "フランス" },
  { key: "germany", label: "ドイツ" },
  { key: "uk", label: "イギリス" },
  { key: "spain", label: "スペイン" },
  { key: "portugal", label: "ポルトガル" },
  { key: "italy", label: "イタリア" },
  { key: "austria", label: "オーストリア" },
  { key: "russia", label: "ロシア・ソ連" },
  { key: "usa", label: "アメリカ合衆国" },
];

const TAG_KEY_PATTERN = /^[a-z0-9-]+$/;

/** ユーザー入力を #なしスラッグへ正規化する（大文字→小文字、空白→ハイフン等）。 */
export function normalizeTagInput(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/^#/, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (!cleaned || !TAG_KEY_PATTERN.test(cleaned)) return null;
  return cleaned;
}

export function tagLabel(key: string): string {
  return CORE_TAGS.find((t) => t.key === key)?.label ?? `#${key}`;
}
