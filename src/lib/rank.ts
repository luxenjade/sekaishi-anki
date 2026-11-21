/** rank_points からランク名を返す */
export function getRank(points: number): string {
  if (points < 100) return "見習い史家 (Apprentice)";
  if (points < 300) return "初学者 (Novice)";
  if (points < 700) return "年代記者 (Chronicler)";
  if (points < 1500) return "歴史家 (Historian)";
  if (points < 3000) return "碩学 (Scholar)";
  return "歴史の証人 (Witness)";
}
