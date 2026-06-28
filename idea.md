# Blueprint — 世界史年号暗記 PWA

> ステータス: 設計フェーズ  
> 最終更新: 2026-05-22  
> 個人開発 / Netlify + Supabase + React + Vite

---

## 0. 概要

世界史の年号暗記に特化したモバイルファーストのPWA。  
Supabaseで認証・ユーザーデータ・問題データをすべて管理する。問題データはSupabaseから動的取得（静的JSON生成なし）。フロントエンドはReact + Viteで実装し、既存CSSデザインの根幹（CSS変数・クラス設計）を継承する。

---

## 1. 技術スタック

| レイヤー             | 採用技術                    | 備考                                      |
| -------------------- | --------------------------- | ----------------------------------------- |
| ホスティング         | Netlify                     | Viteビルド成果物を配信                    |
| 認証・DB             | Supabase                    | Auth / PostgreSQL                         |
| 問題データ           | Supabase (`wh_dates`)       | 動的取得。将来的にキャッシュ戦略を検討    |
| フロントエンド       | React 18 + Vite             | TypeScriptは使わない（素のJS）            |
| スタイル             | CSS変数 + CSS Modules       | 既存 `quiz-shell.css` のCSS変数設計を継承 |
| 状態管理             | React Context + useState    | 外部ライブラリなし                        |
| Supabaseクライアント | `@supabase/supabase-js` v2  |                                           |
| PWA                  | `vite-plugin-pwa` (Workbox) | manifest・SW自動生成                      |

### なぜReact + Viteか

このアプリは「認証状態・現在のタブ・復習リスト・出題モード設定」など**グローバルに共有する状態が多い**。Vanilla JSでタブルーターと認証状態を手書きするよりも、Contextで状態を流すReactの方が保守しやすい。既存の`choice-buttons.js`等のロジックはReactコンポーネントに移植する（CSS資産はそのまま流用）。

### なぜ動的取得か

問題データは数百〜千程度の規模。Supabaseから直接取得しても十分高速で、ビルドスクリプトの管理コストを払う必要がない。問題が数千を超えてパフォーマンス上の問題が出た時点で静的JSON化を検討する。

---

## 2. アプリ構造

### 2.1 タブ構成（左→右）

| #   | タブ名 | アイコン      | 役割                   |
| --- | ------ | ------------- | ---------------------- |
| 1   | 出題   | `play`        | クイズ実施             |
| 2   | 復習   | `bookmark`    | 復習リスト管理・出題   |
| 3   | 投稿   | `plus-circle` | 問題データ投稿         |
| 4   | 統計   | `bar-chart-2` | 学習進捗の可視化       |
| 5   | 設定   | `settings`    | アカウント・アプリ設定 |

タブバーはモバイルでは画面下部に固定。デスクトップでは左サイドバーへの変換を将来検討（現在はモバイル優先）。

### 2.2 画面遷移

```
[未認証]
  └─ AuthScreen（ログイン / 新規登録 切り替え）
       └─ 確認メール → 認証成功 → AppShellへ

[認証済み] AppShell
  ├─ [出題タブ] QuizTab
  │    ├─ QuizSetup    — 範囲・問題数設定
  │    ├─ QuizSession  — 出題・フィードバック
  │    └─ QuizResult   — 結果・復習リスト自動追加
  │
  ├─ [復習タブ] ReviewTab
  │    ├─ ReviewList   — 復習リスト一覧
  │    └─ QuizSession  — 出題UI共通（アクセントカラーのみ変更）
  │
  ├─ [投稿タブ] SubmitTab
  │    └─ SubmitForm   — 3ステップ入力
  │
  ├─ [統計タブ] StatsTab
  │    └─ StatsView    — グラフ・ランク表示
  │
  └─ [設定タブ] SettingsTab
       ├─ 出題モード設定
       ├─ テーマ切り替え
       ├─ プロフィール編集
       └─ アカウント管理
```

### 2.3 Contextの設計

```
AuthContext       — user, session, loading
ProfileContext    — profile（quiz_mode, theme, stats等）, updateProfile()
ReviewContext     — reviewItems[], addToReview(), removeFromReview()
```

`ReviewContext` はタブをまたいで復習リストを参照・更新するために必要。

---

## 3. データベース設計

### 3.1 既存テーブル（変更なし）

**`wh_dates`** — 問題マスターデータ（管理者のみ編集）  
**`wh_regions`** — 地域マスター（`key`, `label`, `sort`）

### 3.2 新規テーブル

#### `profiles`

```sql
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  avatar_url text,                     -- Supabase Storage のパス

  -- アプリ設定
  quiz_mode text not null default 'year_to_event'
    check (quiz_mode in ('year_to_event', 'event_to_year')),
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),

  -- 統計（非正規化・高速読み出し用）
  total_answered integer not null default 0,
  total_correct   integer not null default 0,
  streak_current  integer not null default 0,
  streak_best     integer not null default 0,
  last_played_at  date,

  -- ランク（後実装）
  rank_points integer not null default 0,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

> **アバター管理**: Supabase Storage の `avatars` バケットを使用。アップロード後のpublic URLを `avatar_url` に保存する。

#### `field_stats`

分野別の正解率。`profiles` と 1:N。

```sql
create table public.field_stats (
  id       bigint generated always as identity primary key,
  user_id  uuid references public.profiles(id) on delete cascade not null,
  field    text not null,   -- wh_dates.field と同値
  answered integer not null default 0,
  correct  integer not null default 0,
  updated_at timestamp with time zone default now(),
  unique(user_id, field)
);
```

#### `review_items`

不正解時に自動upsertされる復習リスト。

```sql
create table public.review_items (
  id              bigint generated always as identity primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  question_id     bigint references public.wh_dates(id) on delete cascade not null,
  added_at        timestamp with time zone default now(),
  review_count    integer not null default 0,
  last_reviewed_at timestamp with time zone,
  unique(user_id, question_id)   -- 同一問題の重複登録を防ぐ
);
```

#### `wh_submissions`

ユーザーからの投稿受付。`wh_dates` よりカラムを絞って投稿ハードルを下げる。

```sql
create table public.wh_submissions (
  id            bigint generated always as identity primary key,
  user_id       uuid references public.profiles(id) on delete set null,
  year          integer not null,    -- 負数で紀元前
  year_end      integer,             -- 期間の場合
  event         text not null,
  description   text,
  region        text[],              -- wh_regions.key の配列（チェックボックス複数選択）
  field         text,
  status        text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewer_note text,
  created_at    timestamp with time zone default now()
);
```

> **レビューフロー**: 投稿 → `pending` → 管理者レビュー → 承認時に `wh_dates` へ手動コピー → `approved` に更新。
> `region` は `wh_regions` テーブルを参照したチェックボックスUIで複数選択する。

### 3.3 Row Level Security (RLS)

| テーブル         | SELECT           | INSERT       | UPDATE   | DELETE   |
| ---------------- | ---------------- | ------------ | -------- | -------- |
| `profiles`       | 本人のみ         | 本人のみ     | 本人のみ | 本人のみ |
| `field_stats`    | 本人のみ         | 本人のみ     | 本人のみ | —        |
| `review_items`   | 本人のみ         | 本人のみ     | 本人のみ | 本人のみ |
| `wh_submissions` | 本人のみ         | ログイン済み | —        | —        |
| `wh_dates`       | 全員（anon含む） | —            | —        | —        |
| `wh_regions`     | 全員（anon含む） | —            | —        | —        |

---

## 4. 機能仕様

### 4.1 認証

- メールアドレス＋パスワード（Supabase Auth）
- 確認メールはSupabaseデフォルト
- セッション管理: `onAuthStateChange()` → `AuthContext` に反映
- 未認証時はタブバーを非表示にし `AuthScreen` のみ表示

### 4.2 出題タブ（QuizTab）

**QuizSetup**

- 範囲選択モード: 時代別（9区分）/ 地域別（`wh_regions` から動的取得）
- 問題数: 10 / 20 / 30 / 全問
- 現在の出題モードを表示（設定タブへのリンク付き）

**QuizSession**

- `year_to_event` モード: 年号表示 → 4択（シャッフル）
- `event_to_year` モード: 出来事表示 → 年号テキスト入力（`inputmode="numeric"`）
  - 紀元前はマイナス入力
- 問題ごとにインラインフィードバック（正誤・正解表示）
- 進捗バー

**QuizResult**（セッション終了後）

- 正解数・正解率
- 不正解問題一覧（イベント名・正解年号）
- 不正解問題を `review_items` に自動 upsert
- `profiles` / `field_stats` の統計を更新

### 4.3 復習タブ（ReviewTab）

- `review_items` JOIN `wh_dates` で一覧取得
- 表示: 出来事名・年号・追加日・復習回数
- 「復習開始」で QuizSession を起動（`--qz-accent` をオレンジ系に上書き）
- 正解した問題は `review_items` から削除（正解=卒業の定義）
- 個別に「削除」ボタンで手動削除も可能
- 復習完了時に `review_count` / `last_reviewed_at` を更新

### 4.4 投稿タブ（SubmitTab）

3ステップ入力（ステップインジケーター付き）

**Step 1 — 基本情報**

- 年号（必須）: 数値入力
- 年号終了（任意）: 期間の場合
- 出来事名（必須）: テキスト

**Step 2 — 詳細**

- 説明（任意）
- 分野（任意）: select（`wh_dates.field` のcheck constraintと同値）
- 地域（任意）: `wh_regions` から動的取得したチェックボックス複数選択 → `region text[]` に格納

**Step 3 — 確認・送信**

- 入力内容プレビュー
- 同一西暦チェック: `wh_dates` を year でクエリし、同じ年号の出来事があればインラインで表示（重複投稿防止）
- 「送信」で `wh_submissions` に INSERT

### 4.5 統計タブ（StatsTab）

- 総取り組み数・全体正解率
- 連続学習日数（現在・最高）
- 分野別正解率: 横バーグラフ（SVGまたはCSS幅）
- ユーザーランク表示（後実装）

**ランク制度（後実装・設計のみ）**

`profiles.rank_points` をベースにランク算出。正解ごとにポイント付与（詳細ルールは後定義）。

| ランク     | 必要ポイント |
| ---------- | ------------ |
| 見習い史家 | 0            |
| 初学者     | 100          |
| 年代記者   | 300          |
| 歴史家     | 700          |
| 碩学       | 1500         |
| 歴史の証人 | 3000         |

### 4.6 設定タブ（SettingsTab）

- **出題モード**: `year_to_event` / `event_to_year` を切り替え → `profiles.quiz_mode` に保存
- **テーマ**: ライト / ダーク / システム → `profiles.theme` に保存、即時反映
- **ユーザーネーム変更**
- **アバター変更**: Supabase Storage にアップロード
- **メールアドレス変更**: `supabase.auth.updateUser()`
- **パスワード変更**: `supabase.auth.updateUser()`
- **ログアウト**
- **アカウント削除**: 2段階確認モーダル

---

## 5. UIデザイン方針

- **ミニマル＆テキスト優先**: 装飾より可読性。余白を広くとる
- **カラーパレット**: 後で提供予定。暫定で既存 `--qz-accent: #faba40` ベース
- **アイコン**: Heroicons（Tailwind系）をインラインSVGで使用
- **タイポグラフィ**: ヒラギノ / Yu Gothic系（既存継続）
- **タッチターゲット**: 最小44px
- **復習タブのアクセントカラー**: `--qz-accent: #f97316`（オレンジ）で出題タブと区別

### テーマ実装

`ProfileContext` の `theme` 値に応じて `<html>` に `data-theme="dark"` を付与。  
`system` の場合は `matchMedia('(prefers-color-scheme: dark)')` に従う。  
CSSは既存の `body.dark {}` セレクタから `[data-theme="dark"] {}` に移行。

### 既存CSSの継承方針

`quiz-shell.css` のCSS変数定義（`--qz-accent`, `--qz-surface`, `--qz-text` 等）とクラス設計（`.qz-btn`, `.qz-choice`, `.qz-feedback` 等）をReactコンポーネントにそのまま適用する。CSS Modulesは使わず、グローバルCSSとして読み込む。

---

## 6. ファイル構成（案）

```
/
├── src/
│   ├── main.jsx
│   ├── App.jsx                  ← AuthContext確認・AppShell or AuthScreen
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── ProfileContext.jsx
│   │   └── ReviewContext.jsx
│   ├── lib/
│   │   └── supabase.js          ← createClient（既存 supabase_config.js の移植）
│   ├── screens/
│   │   ├── AuthScreen.jsx       ← ログイン・登録
│   │   └── AppShell.jsx         ← タブバー + タブルーター
│   ├── tabs/
│   │   ├── QuizTab.jsx
│   │   ├── ReviewTab.jsx
│   │   ├── SubmitTab.jsx
│   │   ├── StatsTab.jsx
│   │   └── SettingsTab.jsx
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── QuizSetup.jsx
│   │   │   ├── QuizSession.jsx
│   │   │   ├── QuizResult.jsx
│   │   │   ├── ChoiceButtons.jsx    ← choice-buttons.js の移植
│   │   │   ├── TextInput.jsx        ← text-input.js の移植
│   │   │   ├── FeedbackBanner.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── submit/
│   │   │   └── SubmitForm.jsx
│   │   └── ui/
│   │       ├── TabBar.jsx
│   │       ├── Modal.jsx
│   │       └── StepIndicator.jsx
│   └── styles/
│       ├── quiz-shell.css           ← 既存そのまま（CSS変数・コンポーネントクラス）
│       └── app.css                  ← タブバー・認証画面など新規
├── public/
│   ├── manifest.json
│   └── icons/
├── index.html
└── vite.config.js               ← vite-plugin-pwa を設定
```

---

## 7. PWA設定

`vite-plugin-pwa` (Workbox) を使用。`vite.config.js` で設定を完結させる。

### キャッシュ戦略

| リソース                               | 戦略                                                      |
| -------------------------------------- | --------------------------------------------------------- |
| JSバンドル・CSS・フォント              | Cache First                                               |
| Supabase API（認証・進捗・問題データ） | Network First（オフライン時はキャッシュにフォールバック） |

問題データは動的取得のため「オフラインでの出題」はPhase 8以降に対応を検討する（取得済みデータをIndexedDBにキャッシュする方法が現実的）。

---

## 8. 未決事項

| 項目                 | 内容                                         | 優先度 |
| -------------------- | -------------------------------------------- | ------ |
| カラーパレット       | モックアップ前に提供が望ましい               | 高     |
| 復習完了の定義       | 正解したら即削除（現在の方針）でよいか       | 中     |
| streak判定の基準時刻 | 日本時間（JST）基準か UTC か                 | 低     |
| オフライン出題       | IndexedDBキャッシュで対応するか、諦めるか    | 低     |
| スマホ4択補助UI      | `event_to_year` モードでの数字キーパッド拡張 | 低     |
| wiki_scoreバッチ     | 月次でwiki URLアクセス数を取得するスクリプト | 後回し |

---

## 9. 実装フェーズ案

| フェーズ | 内容                                             |
| -------- | ------------------------------------------------ |
| Phase 1  | DB設計・RLS設定（新規テーブル4本）               |
| Phase 2  | Viteプロジェクト初期化・Context設計・認証フロー  |
| Phase 3  | AppShell・タブバー・ルーター                     |
| Phase 4  | 出題タブ（QuizSetup / QuizSession / QuizResult） |
| Phase 5  | 復習タブ                                         |
| Phase 6  | 設定タブ・プロフィール                           |
| Phase 7  | 統計タブ                                         |
| Phase 8  | 投稿タブ                                         |
| Phase 9  | PWA（vite-plugin-pwa・Workbox設定）              |
| Phase 10 | ランク制度・wiki_scoreバッチ                     |
