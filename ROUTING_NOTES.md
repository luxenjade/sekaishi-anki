# 紹介ページ + /app ルーティングの更新メモ

## 追加・置き換えるファイル
- src/main.tsx（置き換え: パスで紹介ページ / アプリ / 404 を切り替える）
- src/AppRoot.tsx（新規: アプリ本体 + AuthProvider。/app でだけ遅延読み込みされる）
- src/features/landing/Landing.tsx（新規: 紹介ページ）
- src/features/landing/NotFound.tsx（新規: 404）
- src/contexts/AuthContext.tsx（置き換え: 確認メール・パスワード再設定の戻り先を /app に変更）
- index.html（置き換え: 紹介ページ向けのタイトル・OGP・canonical。viewport-fit=cover を追加）
- public/sitemap.xml, public/robots.txt, public/llms.txt（置き換え）

## ルーティング
| パス | 表示 |
| --- | --- |
| `/` | 紹介ページ |
| `/app`, `/app/…` | アプリ本体（未ログインならログイン画面） |
| その他 | 404 |

- ルーターのライブラリは使わず、`window.location.pathname` で切り替えています。
- ページ間の移動は通常のリンク（フルリロード）です。netlify.toml の `/* → /index.html` の設定のままで動きます。
- アプリ本体（Supabase・グラフ等）は `/app` を開いたときだけ読み込むため、紹介ページは軽く表示されます。
- 将来 `/app/stats` のようにタブごとの URL が必要になったら、React Router を導入して AppRoot の中に入れてください。

## 手作業が必要なこと（Supabase）
Authentication → URL Configuration の Redirect URLs に、次を追加してください。
- `https://<本番のドメイン>/app`
- `http://localhost:5173/app`

これを忘れると、確認メールやパスワード再設定のリンクが、許可されていない戻り先として扱われます。
