# フロントエンド更新メモ（新スキーマ対応）

## 置き換え・追加するファイル（src/ 配下にそのまま上書き）
- types/quiz.ts
- lib/taxonomy.ts（新規）  lib/database.ts  lib/questions.ts
- lib/similar.ts（新規）  lib/rank.ts（新規）
- hooks/useUserData.ts（新規）
- contexts/AuthContext.tsx
- App.tsx
- features/submit/SubmitTab.tsx
- features/admin/AdminTab.tsx（新規）
- components/layout/BottomNav.tsx  components/layout/Header.tsx

## 削除するファイル
- src/lib/submit-mappers.ts（提出フォームから分類欄を外したため不要）

## 手作業で直す箇所（アップロードされたコードに対して）
1. features/settings/SettingsTab.tsx
   - `<TrashDataRow />` の使用箇所と、`function TrashDataRow()` の定義を削除（動作しないダミー行）
2. features/quiz/ResultScreen.tsx
   - 「Save to Review」ボタン（onClick のない <button>）を削除（成績は自動で保存される）

## 前提・確認事項
- ここの内容は、アップロードされた src/ の状態を前提に書いています。
- data/mockEvents.ts は触っていません。旧項目 region / field は型に deprecated の任意項目として残してあるので、そのままコンパイルできます。
- 型チェックは、React を使わないモジュール（types / lib）のみ実行して通過を確認。React を含むファイルは手元で `pnpm typecheck` を実行してください。
