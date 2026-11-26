/**
 * メールのリンク（確認・パスワード再設定）から戻ってきたときの URL にあるエラーを読み取る。
 *
 * リンクが期限切れ・使用済みのとき、Supabase は戻り先の URL に
 *   #error=access_denied&error_code=otp_expired&error_description=...
 * を付ける。Supabase クライアントは作られた直後に URL を読んで消すことがあるため、
 * このモジュールをクライアント生成より先に評価し、その時点の URL を控えておく
 * （lib/supabase.ts が先頭で import する）。
 */

export interface AuthRedirectError {
  /** error_code（例: otp_expired）。無ければ error の値 */
  code: string;
}

function capture(): AuthRedirectError | null {
  if (typeof window === "undefined") return null;

  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const fromQuery = new URLSearchParams(window.location.search);

  for (const params of [fromHash, fromQuery]) {
    const code = params.get("error_code") ?? params.get("error");
    if (code) return { code };
  }
  return null;
}

/** ページを開いた時点で URL にあったエラー（無ければ null） */
export const authRedirectError: AuthRedirectError | null = capture();

/** URL に残ったエラー用のパラメータを消す（リロードで同じ表示が出続けないように） */
export function clearAuthRedirectParams(): void {
  if (typeof window === "undefined") return;
  if (window.location.hash || window.location.search) {
    window.history.replaceState(null, "", window.location.pathname);
  }
}
