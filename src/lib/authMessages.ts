/** Supabase Auth の英語のエラーメッセージを、画面に出す日本語にする */
export function authErrorMessage(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();

  if (m.includes("invalid login credentials"))
    return "メールアドレスまたはパスワードが正しくありません。";
  if (m.includes("email not confirmed"))
    return "メールアドレスの確認が終わっていません。届いた確認メールのリンクを開いてください。";
  if (m.includes("user already registered"))
    return "このメールアドレスはすでに登録されています。ログインするか、パスワードを再設定してください。";
  if (m.includes("rate limit") || m.includes("too many requests") || m.includes("security purposes"))
    return "短時間にリクエストが集中しています。しばらく待ってから、もう一度お試しください。";
  if (m.includes("should be different from the old password"))
    return "現在のパスワードと同じです。別のパスワードにしてください。";
  if (m.includes("at least") && m.includes("character"))
    return "パスワードが短すぎます。もう少し長くしてください。";
  if (m.includes("weak") || m.includes("pwned"))
    return "このパスワードは推測されやすいため使えません。別のパスワードにしてください。";
  if (m.includes("session") && (m.includes("missing") || m.includes("expired")))
    return "再設定の有効期限が切れました。もう一度、再設定メールを送信してください。";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "通信に失敗しました。接続を確認して、もう一度お試しください。";

  return message || "エラーが発生しました。";
}

/** メールのリンクから戻った URL のエラーコードに対する案内 */
export function authRedirectMessage(code: string): string {
  if (code === "otp_expired" || code === "access_denied")
    return "リンクの有効期限が切れているか、すでに使われています。もう一度、メールを送信してください。";
  return "メールのリンクの処理に失敗しました。もう一度お試しください。";
}
