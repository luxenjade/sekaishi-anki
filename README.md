# sekaishi-anki

世界史の重要な出来事と年号を効率よく覚えるためのWebクイズアプリです。Supabase 認証でログインすると、復習リスト・統計・設定がクラウドに同期されます。

## 主な機能

- **双方向クイズ**: 「出来事 → 年号」（記述式）と「年号 → 出来事」（4択）
- **範囲指定**: 章別・時代区分別に出題範囲を絞り込み
- **アカウント認証**: Supabase Auth（メール + パスワード）
- **復習キュー**: 間違えた問題を自動保存、正解で卒業
- **統計・ランク**: 正解率、連続学習日数、ポイント制ランク
- **問題投稿**: ユーザー投稿を `wh_submissions` に保存（管理者承認フロー）
- **ダークモード**: プロフィールと連動

## 技術スタック

- React 19 + Vite + TypeScript
- Tailwind CSS + Lucide React
- Supabase (Auth, PostgreSQL, RLS)
- Netlify（静的ホスティング）

## ローカル開発

```bash
pnpm install
cp .env.example .env
# .env に Supabase の URL / anon key を設定
pnpm dev
```

`.env` 未設定時は **デモモード**（localStorage のみ）で動作します。

## ビルド

```bash
pnpm typecheck
pnpm build
pnpm preview
```

## Supabase セットアップ

詳細は [`supabase/README.md`](supabase/README.md) を参照してください。

1. Supabase プロジェクトを作成
2. `supabase/migrations/20260711000000_init.sql` を実行（ユーザー系テーブルのみ）
3. 問題マスター `wh_dates` / `wh_regions` は [`supabase.sql`](supabase.sql) の既存スキーマを使用

## Netlify へのデプロイ

1. GitHub リポジトリを Netlify に接続
2. ビルド設定（`netlify.toml` 済み）:
   - Build command: `pnpm run build`
   - Publish directory: `dist`
3. **Environment variables** に追加:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Supabase の Redirect URLs に Netlify の URL を登録

SPA ルーティング用のリダイレクトは `netlify.toml` に設定済みです。

## ディレクトリ

| パス | 内容 |
| ---- | ---- |
| `src/` | React アプリ本体 |
| `src/contexts/AuthContext.tsx` | 認証・プロフィール・DB同期 |
| `src/lib/questions.ts` | 問題データ取得（Supabase → モック fallback） |
| `supabase/migrations/` | ユーザー系テーブル（profiles 等） |
| `supabase.sql` | 既存の問題マスタースキーマ |
| `quiz-model/` | 旧 Vanilla JS クイズ（参考） |

## Docker

```bash
docker compose up          # 開発
docker build -t sekaishi-anki . && docker run -p 8080:80 sekaishi-anki  # 本番確認
```
