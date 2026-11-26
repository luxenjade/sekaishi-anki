# パスワード再設定の動線

## 追加・置き換えるファイル
- src/features/auth/AuthScreen.tsx（置き換え: 「パスワードを忘れた方はこちら」→ 再設定メールの送信。qz デザインに統一。紹介ページへの戻りリンクも追加）
- src/features/auth/ResetPasswordScreen.tsx（新規: 新しいパスワードの入力画面）
- src/contexts/AuthContext.tsx（置き換え: 再設定中の状態 isPasswordRecovery と、updatePassword / finishPasswordRecovery / cancelPasswordRecovery）
- src/App.tsx（置き換え: 再設定中は ResetPasswordScreen だけを出す）
- src/lib/authRedirect.ts（新規: メールのリンクから戻ったときの URL のエラーを、Supabase が消す前に控える）
- src/lib/authMessages.ts（新規: Supabase のエラーを日本語にする）
- src/lib/supabase.ts（置き換え: 先頭で authRedirect を import するだけの変更）
- src/features/site/FaqPage.tsx（置き換え: 「パスワードを忘れました」を追加）

## 流れ
1. ログイン画面 →「パスワードを忘れた方はこちら」→ メールアドレスを入力 → 再設定メールを送信（30秒は再送できない）
2. メールのリンクを開く → /app に戻る → Supabase が PASSWORD_RECOVERY を通知 → 新しいパスワードの入力画面
3. 新しいパスワード（確認つき）を保存 →「アプリへ進む」
- 再設定の途中でリロードしても、入力画面に戻る（sessionStorage の印）。
- 「やめてログイン画面に戻る」を選ぶと、再設定用のセッションをサインアウトする。
- リンクが期限切れ・使用済みのときは、再設定メールの再送画面に、案内つきで入る。
- 登録の有無は画面では明かさない（「登録されているメールアドレスであれば…」と表示）。
- 設定画面の「Reset Password」（ログイン中）も、同じ流れに合流する。

## Supabase 側の確認
- Authentication → URL Configuration の Redirect URLs に `https://<本番のドメイン>/app` と `http://localhost:5173/app` が入っていること。
- メールの文面は、Authentication → Email Templates の「Reset Password」で日本語にできる。リンクの有効期間も設定で変えられる。
- パスワードの最小文字数は、画面側は6文字。Supabase の設定でもっと長くしている場合は、そちらが優先され、エラーは日本語で表示される。
