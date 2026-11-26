import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Info, KeyRound, Mail, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { isSupabaseConfigured } from "../../lib/supabase";
import {
  authRedirectError,
  clearAuthRedirectParams,
} from "../../lib/authRedirect";
import { authErrorMessage, authRedirectMessage } from "../../lib/authMessages";

type Mode = "signin" | "signup" | "forgot";

/** 再設定メールを続けて送れないようにする待ち時間（秒） */
const RESEND_COOLDOWN = 30;

const inputClass =
  "w-full px-4 py-3 rounded-qz-md border-[1.5px] border-qz-border bg-qz-surface2 text-qz-text text-sm font-semibold outline-none transition focus:border-qz-accent focus:ring-[3px] focus:ring-qz-accent-ring";

const TITLES: Record<Mode, { title: string; sub: string }> = {
  signin: {
    title: "世界史年代暗記にログイン",
    sub: "ログインして復習リストと成績を同期",
  },
  signup: {
    title: "アカウント登録",
    sub: "アカウントを作成して学習記録をクラウドに保存",
  },
  forgot: {
    title: "パスワードの再設定",
    sub: "登録したメールアドレスに、再設定用のリンクを送ります",
  },
};

export function AuthScreen() {
  const { signIn, signUp, resetPassword, bypassAuth } = useAuth();

  // 期限切れ・使用済みのリンクから戻ってきたときは、再設定メールの再送画面を出す
  const [mode, setMode] = useState<Mode>(
    authRedirectError ? "forgot" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(
    authRedirectError ? authRedirectMessage(authRedirectError.code) : null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const supabaseConfigured = isSupabaseConfigured();

  // URL に残ったエラー用のパラメータは、読み取ったら消す
  useEffect(() => {
    if (authRedirectError) clearAuthRedirectParams();
  }, []);

  // 再送までのカウントダウン
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!username.trim()) {
          setError("ユーザー名を入力してください。");
          return;
        }
        const res = await signUp(email, password, username);
        if (res.error) {
          setError(
            authErrorMessage(res.error.message) ||
              "サインアップに失敗しました。",
          );
        } else {
          setMessage(
            "確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。",
          );
          setMode("signin");
        }
      } else if (mode === "forgot") {
        const res = await resetPassword(email.trim());
        if (res.error) {
          setError(authErrorMessage(res.error.message));
        } else {
          // 登録の有無は、画面では明かさない
          setMessage(
            "登録されているメールアドレスであれば、再設定用のリンクを送信しました。届かないときは、迷惑メールフォルダも確認してください。",
          );
          setCooldown(RESEND_COOLDOWN);
        }
      } else {
        const res = await signIn(email, password);
        if (res.error) {
          setError(
            authErrorMessage(res.error.message) || "ログインに失敗しました。",
          );
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? authErrorMessage(err.message)
          : "エラーが発生しました。",
      );
    } finally {
      setLoading(false);
    }
  };

  const { title, sub } = TITLES[mode];
  const submitLabel =
    mode === "signup"
      ? "登録する"
      : mode === "forgot"
        ? message
          ? cooldown > 0
            ? `もう一度送る（${cooldown}）`
            : "もう一度送る"
          : "再設定メールを送る"
        : "ログインする";

  return (
    <div className="min-h-screen bg-qz-bg text-qz-text font-sans flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-4">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-qz-sub hover:text-qz-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          紹介ページへ
        </a>

        <div className="bg-qz-surface border border-qz-border rounded-qz-lg shadow-qz-md p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-qz-md bg-qz-accent-light border border-qz-accent text-qz-accent-text mb-1">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-xs text-qz-sub">{sub}</p>
          </div>

          {!supabaseConfigured && (
            <div className="p-4 rounded-qz-md border border-qz-accent bg-qz-accent-light space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-qz-accent-text" />
                <div className="text-[11px] leading-relaxed text-qz-text">
                  <p className="font-bold">Supabaseの接続キーが未設定です</p>
                  <p className="opacity-90">
                    `.env` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_PB_KEY`
                    を設定すると本番認証が有効になります。
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={bypassAuth}
                className="w-full py-2 px-3 rounded-qz-sm bg-qz-accent text-qz-ink font-bold text-xs hover:opacity-90 transition active:scale-95"
              >
                デモモードで続行（ローカル保存）
              </button>
            </div>
          )}

          {supabaseConfigured && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-qz-sm bg-qz-incorrect-bg border border-qz-incorrect text-qz-incorrect text-xs font-semibold text-center"
                >
                  {error}
                </div>
              )}
              {message && (
                <div
                  role="status"
                  className="p-3 rounded-qz-sm bg-qz-correct-bg border border-qz-correct text-qz-correct text-xs font-semibold text-center leading-relaxed"
                >
                  {message}
                </div>
              )}

              {mode === "signup" && (
                <Field icon={<User className="w-3 h-3" />} label="ユーザー名">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="例: s_historian"
                    className={inputClass}
                  />
                </Field>
              )}

              <Field icon={<Mail className="w-3 h-3" />} label="メールアドレス">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>

              {mode !== "forgot" && (
                <Field
                  icon={<KeyRound className="w-3 h-3" />}
                  label="パスワード"
                >
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6文字以上"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    className={inputClass}
                  />
                  {mode === "signin" && (
                    <div className="text-right pt-1">
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs font-semibold text-qz-accent-text hover:underline"
                      >
                        パスワードを忘れた方はこちら
                      </button>
                    </div>
                  )}
                </Field>
              )}

              <button
                type="submit"
                disabled={loading || (mode === "forgot" && cooldown > 0)}
                className="w-full py-3.5 rounded-qz-sm bg-qz-accent text-qz-ink font-bold text-sm shadow-qz-sm hover:opacity-90 transition disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "処理中..." : submitLabel}
              </button>
            </form>
          )}

          {supabaseConfigured && (
            <div className="text-center pt-1 space-y-2">
              {mode === "forgot" ? (
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-xs font-semibold text-qz-accent-text hover:underline"
                >
                  ログインに戻る
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    switchMode(mode === "signup" ? "signin" : "signup")
                  }
                  className="text-xs font-semibold text-qz-accent-text hover:underline"
                >
                  {mode === "signup"
                    ? "すでにアカウントをお持ちですか？ ログイン"
                    : "アカウントをお持ちでないですか？ 新規作成"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-qz-sub uppercase tracking-widest px-1 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
