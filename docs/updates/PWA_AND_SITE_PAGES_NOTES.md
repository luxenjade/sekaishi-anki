# PWA 化 + About / FAQ / プライバシーポリシー

## 追加・置き換えるファイル
### サイトのページ
- src/main.tsx（置き換え: /about /faq /privacy-policy を追加。末尾スラッシュも許容）
- src/SitePages.tsx（新規）
- src/features/site/{siteInfo.ts, SiteShell.tsx, prose.tsx, AboutPage.tsx, FaqPage.tsx, PrivacyPolicyPage.tsx}（新規）
- src/features/landing/Landing.tsx（置き換え: 共通のヘッダー・フッター SiteShell を使う）
- public/sitemap.xml, public/llms.txt（置き換え）

### PWA（/app のみ）
- public/manifest.webmanifest（新規）  public/sw.js（新規）
- public/icons/{icon-192, icon-512, icon-maskable-512, apple-touch-icon}.png（新規）
- public/favicon.svg（置き換え: Vite の初期ロゴからカレンダー柄へ）
- index.html（置き換え: manifest・iOS 用メタを追加）
- netlify.toml（置き換え: sw.js と manifest のヘッダーを追加）
- src/AppRoot.tsx（置き換え: service worker を登録）
- src/App.tsx（置き換え: オフライン案内・インストール案内を追加）
- src/pwa/registerServiceWorker.ts, src/hooks/useOnlineStatus.ts, src/hooks/useInstallPrompt.ts,
  src/components/pwa/PwaBanners.tsx（新規）

## 公開前に必ずやること
1. src/features/site/siteInfo.ts の `contactUrl` を設定する（例: "mailto:you@example.com"、問い合わせフォームのURL）。
   未設定のままだと、各ページに「連絡先は準備中です」と表示される。
2. プライバシーポリシーの内容（特に「広告・第三者のアクセス解析は使用していない」）が実態と合っているか確認する。
   アクセス解析などを追加したときは、ポリシーを更新して、siteInfo.ts の最終更新日も変える。

## PWA の動き
- スコープは /app。manifest の start_url / scope / id も /app。紹介ページ（/）はインストール対象外。
- service worker は本番ビルドでのみ登録（vite dev では登録しない）。
- ページ遷移: ネットワーク優先。失敗したら保存済みの殻（index.html）を返す。
- 静的ファイル: 保存済みを返しつつ裏で更新。
- 問題マスター: `wh_dates` の `is_published=eq.true` の取得だけを、ネットワーク優先で保存。失敗したら保存済みを返す。
- それ以外（認証・成績・復習・提出）: 一切キャッシュしない。
- キャッシュ構造を変えたら public/sw.js の VERSION を上げる（古いキャッシュは自動で削除される）。
- オフライン中は、保存済みの問題で解答できるが、成績は保存されない（画面上部に案内を表示）。

## 確認方法
- Chrome の開発者ツール → Application → Manifest / Service Workers で、/app の登録とインストール可否を確認。
- Lighthouse の PWA 項目で確認。
- iPhone では Safari の共有 → 「ホーム画面に追加」。
