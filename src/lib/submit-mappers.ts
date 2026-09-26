/** 投稿フォーム → DB保存値への変換 */

import { isKnownTheme } from "./themes";
import { normalizeTagInput } from "../data/tags";

/**
 * テーマキーの検証のみ行う。以前は日本語⇔英語の変換テーブルを持っていたが、
 * DB側のCHECK制約を英語キーに揃えたため変換自体が不要になった。
 * 未知の値は黙って別の分類に丸めず null を返す（呼び出し側で弾く）。
 */
export function validateSubmitField(themeKey: string): string | null {
  return isKnownTheme(themeKey) ? themeKey : null;
}

/** タグ入力配列を正規化する（不正な値は除外）。重複も取り除く。 */
export function mapSubmitTags(rawTags: string[]): string[] {
  const normalized = rawTags
    .map((t) => normalizeTagInput(t))
    .filter((t): t is string => t !== null);
  return Array.from(new Set(normalized));
}
