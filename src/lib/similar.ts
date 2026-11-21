/** 出来事名の表記ゆれを吸収して比較するための正規化 */
function normalize(s: string): string {
  return s.replace(/[\s\u3000()（）「」『』・、。]/g, "").toLowerCase();
}

/**
 * 同じ年の出来事名が「実質同じ」かの目安。
 * 完全一致、または一方が他方を含む（例: 「名誉革命」と「名誉革命(権利の章典)」）。
 * 同じ年でも別の出来事は多いので、ブロックではなく警告にだけ使う。
 */
export function isSimilarEvent(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  if (x.length < 2 || y.length < 2) return false;
  return x === y || x.includes(y) || y.includes(x);
}
