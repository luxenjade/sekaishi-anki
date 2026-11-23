/**
 * サイト共通の情報。About / FAQ / プライバシーポリシーが参照する。
 * contactUrl は公開前に必ず設定すること（例: "mailto:you@example.com" や問い合わせフォーム・GitHub Issues の URL）。
 */
export const SITE = {
  name: "sekaishi-anki",
  nameJa: "世界史年代暗記",
  operator: "luxenjade",
  url: "https://luxenjade.netlify.app",
  /** お問い合わせ先。空のときは「準備中」と表示される */
  contactUrl: "okamotoshoei4512@gmail.com",
  /** プライバシーポリシーの制定日・最終更新日 */
  policyEnactedAt: "2026年11月22日",
  policyUpdatedAt: "2026年11月22日",
} as const;

export const SITE_PAGES = [
  { path: "/about", label: "このアプリについて" },
  { path: "/faq", label: "よくある質問" },
  { path: "/privacy-policy", label: "プライバシーポリシー" },
] as const;
