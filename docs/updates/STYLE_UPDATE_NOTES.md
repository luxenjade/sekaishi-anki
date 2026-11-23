# 見た目の更新メモ（金色アクセントのデザイン）

## 置き換えるファイル
- tailwind.config.js（リポジトリ直下）
- src/index.css
- src/App.tsx
- src/lib/taxonomy.ts
- src/components/layout/BottomNav.tsx
- src/features/quiz/StartScreen.tsx
- src/features/quiz/QuizScreen.tsx
- src/features/quiz/ResultScreen.tsx

## 削除するファイル
- src/components/layout/Header.tsx

## デザインの考え方
- quiz.css の配色（#faba40 の金色、#fafaf8 / #141414 の背景など）を CSS 変数にして index.css に移植。
  Tailwind からは `bg-qz-surface` `text-qz-sub` `border-qz-border` `bg-qz-accent` のように使う。
  ダークモードは変数が切り替わるので、`dark:` を書く必要がない。
- 金色の上の文字は濃紺（`text-qz-ink`）。金色を文字として使うときは、ライトモードで濃紺、ダークモードで金色（`text-qz-accent-text`）。
- 旧クラス `brand-blue` は金色の塗りになる。文字色の補正を index.css の末尾に互換ルールとして入れてあるので、
  統計・設定・提出・管理・認証画面は、そのまま金色の配色になる（コード変更なし）。
  これらを qz-* に移行し終えたら、互換ルールは削除できる。

## 画面ごとの変更
- 出題: カードの角丸 20px、細い進捗バー、章はピル型チップ、選択肢は丸い番号付き。
  4択は回答後も選択肢を残し、正解を緑・選んだ不正解を赤で示す。
- 開始: モード・範囲・問題数を、見出し付きのブロックと選択カードで再構成。
- 結果: 大きなスコア、正解/不正解のタイル、左に赤線のある復習リスト。Enter で終了。
- 下部ナビ: 現在地を金色のバーで示す。安全領域（iPhone 下部）に対応。
