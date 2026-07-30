/** 投稿フォーム → wh_submissions / wh_dates.field 制約（日本語） */

const FIELD_TO_DB: Record<string, string> = {
  Politics: "政治",
  Economy: "経済",
  "Culture/Religion": "文化・宗教",
  Social: "社会",
  "War/Diplomacy": "外交・戦争",
  "Science/Technology": "社会", // DB制約に該当なし — フォールバック
};

const REGION_TO_DB: Record<string, string> = {
  "East Asia": "east-asia",
  Europe: "europe",
  "Middle East": "middle-east",
  Americas: "americas",
  Africa: "africa",
  "South Asia": "south-asia",
  "Central Asia": "central-asia",
  Oceania: "oceania",
};

export function mapSubmitField(label: string): string {
  return FIELD_TO_DB[label] ?? label;
}

export function mapSubmitRegions(labels: string[]): string[] {
  return labels.map((label) => REGION_TO_DB[label] ?? label);
}
