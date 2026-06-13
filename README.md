# sekaishi-anki

`sekaishi-anki` は、世界史の重要な出来事と年号を効率よく覚えるためのWebクイズアプリです。出来事から年号を答える記述式と、年号から出来事を選ぶ4択式の2モードを備えています。

## 主な機能

- **双方向クイズ**: 「出来事 -> 年号」と「年号 -> 出来事」の2形式で学習できます。
- **範囲指定**: 章別、時代区分別に出題範囲を絞れます。
- **出題数の調整**: 5問、10問、20問、全問から選択できます。
- **復習機能**: クイズ結果から間違えた問題だけを再挑戦できます。
- **統計・復習タブ**: 正解率、カテゴリ別の進捗、復習カードのUIを用意しています。
- **問題投稿タブ**: 世界史データベースへ問題を投稿するためのフォームUIを用意しています。
- **設定タブ**: アカウント、テーマ、データ削除、文書リンク、開発者リンクを管理できます。
- **ダークモード**: 設定タブからライト/ダークテーマを切り替えられます。

## 技術スタック

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build/Package**: pnpm

## ディレクトリ概要

- `src/`: React/TypeScript版のアプリ本体
- `quiz-model/`: 既存のVanilla JSクイズモデルと設定
- `wh_admin/`: Supabaseの世界史データを管理するための参考管理画面
- `public/`: favicon、robots、sitemap、LLM向け説明などの公開ファイル
- `plan.md`, `plan2.md`: 実装計画メモ

## セットアップ

```bash
pnpm install
pnpm dev
```

開発サーバーは通常 `http://localhost:5173/` で起動します。

## ビルド

```bash
pnpm build
```

ビルド成果物は `dist/` に出力されます。

## Lint

```bash
pnpm lint
```

現在の依存関係では、ESLint 10 と `jiti` の互換性により設定ファイル読み込みで停止する場合があります。その場合は `jiti` の更新が必要です。

## Docker

開発用コンテナ:

```bash
docker compose up
```

本番用イメージ:

```bash
docker build -t sekaishi-anki:latest .
docker run -d -p 8080:80 --name sekaishi-anki-prod sekaishi-anki:latest
```

`http://localhost:8080` で静的ビルドを確認できます。
