import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { isSupabaseConfigured } from "../../lib/supabase";
import { KeyRound, Mail, User, Info, BookOpen } from "lucide-react";

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError("ユーザー名を入力してください。");
          return;
        }
        const res = await signUp(email, password, username);
        if (res.error) {
          setError(res.error.message || "サインアップに失敗しました。");
        } else {
          setMessage(
            "確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。",
          );
          setIsSignUp(false);
        }
      } else {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error.message || "ログインに失敗しました。");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました。";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#141414] text-[#1a1a1a] dark:text-[#f0f0ec] flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-[#1e1e1e] rounded-2xl border border-[#e0e0da] dark:border-[#333330] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue/15 text-brand-blue mb-2">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isSignUp ? "アカウント登録" : "世界史年代暗記にログイン"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {isSignUp
              ? "アカウントを作成して学習進捗をクラウドに保存"
              : "ログインして復習リストと統計を同期"}
          </p>
        </div>

        {!supabaseConfigured && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-200 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <p className="font-bold">Supabase の接続設定が必要です</p>
                <p className="opacity-90">
                  `.env` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_PB_KEY`
                  を設定し、開発サーバーを再起動してください。オフラインデモは利用できません。
                </p>
              </div>
            </div>
          </div>
        )}

        {supabaseConfigured && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center">
                {message}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-wide px-1 flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  ユーザー名
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="例: sekaishi_taro"
                  className="w-full px-4 py-3 rounded-xl border border-[#e0e0da] dark:border-[#333330] bg-[#fafaf8] dark:bg-[#141414] text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-wide px-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3" />
                メールアドレス
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例: you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-[#e0e0da] dark:border-[#333330] bg-[#fafaf8] dark:bg-[#141414] text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-wide px-1 flex items-center gap-1.5">
                <KeyRound className="w-3 h-3" />
                パスワード
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="w-full px-4 py-3 rounded-xl border border-[#e0e0da] dark:border-[#333330] bg-[#fafaf8] dark:bg-[#141414] text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-blue hover:bg-brand-sky text-white font-black text-sm uppercase tracking-widest shadow-md transition disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "処理中..." : isSignUp ? "登録する" : "ログインする"}
            </button>
          </form>
        )}

        {supabaseConfigured && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-xs text-brand-blue hover:text-brand-sky font-bold transition hover:underline"
            >
              {isSignUp
                ? "すでにアカウントをお持ちですか？ ログイン"
                : "アカウントをお持ちでないですか？ 新規作成"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
