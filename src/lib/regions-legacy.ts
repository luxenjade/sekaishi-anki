/**
 * @deprecated カテゴリー再設計（2026-09）で撤去対象になった region の
 * 表示ラベル。chapter 列が未バックフィルの既存行を暫定表示するためだけに
 * database.ts から参照される。新規コードでは使わないこと。
 */
export const REGION_LABELS: Record<string, string> = {
  "east-asia": "東アジア",
  "central-asia": "中央アジア",
  "south-asia": "南アジア",
  "middle-east": "中東",
  europe: "ヨーロッパ",
  africa: "アフリカ",
  americas: "アメリカ大陸",
  oceania: "オセアニア",
};
