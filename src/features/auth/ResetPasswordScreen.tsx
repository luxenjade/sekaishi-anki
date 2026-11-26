import React, { useState } from "react";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authErrorMessage } from "../../lib/authMessages";

const MIN_LENGTH = 6;

const inputClass =
  "w-full px-4 py-3 rounded-qz-md border-[1.5px] border-qz-border bg-qz-surface2 text-qz-text text-sm font-semibold outline-none transition focus:border-qz-accent focus:ring-[3px] focus:ring-qz-accent-ring";

/**
 * パスワード再設定メールのリンクから戻ってきたときの、新しいパスワードの入力画面。
 * リンクで入った時点でログイン済みの状態になっているので、
 * 「やめる」を選んだときは、サインアウトして元に戻す。
 */
export function ResetPasswordScreen() {
  const { updatePassword, finishPasswordRecovery, cancelPasswordRecovery } =
    useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`パスワードは${MIN_LENGTH}文字以上にしてください。`);
      return;
    }
    if (password !== confirm) {
      setError("確認用のパスワードが一致しません。");
      return;
    }

    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);

    if (res.error) {
      setError(authErrorMessage(res.error.message));
      return;
    }
    setPassword("");
    setConfirm("");
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-qz-bg text-qz-text font-sans flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-qz-surface border border-qz-border rounded-qz-lg shadow-qz-md p-6 sm:p-8 space-y-6">
        {done ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-qz-md bg-qz-correct-bg text-qz-correct">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              パスワードを変更しました
            </h2>
            <p className="text-sm text-qz-sub">
              次回から、新しいパスワードでログインできます。
            </p>
            <button
              type="button"
              onClick={finishPasswordRecovery}
              className="w-full py-3.5 rounded-qz-sm bg-qz-accent text-qz-ink font-bold text-sm hover:opacity-90 transition active:scale-[0.98]"
            >
              アプリへ進む
            </button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-qz-md bg-qz-accent-light border border-qz-accent text-qz-accent-text mb-1">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                新しいパスワードの設定
              </h2>
              <p className="text-xs text-qz-sub">
                新しいパスワードを入力してください（{MIN_LENGTH}文字以上）
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-qz-sm bg-qz-incorrect-bg border border-qz-incorrect text-qz-incorrect text-xs font-semibold text-center"
                >
                  {error}
                </div>
              )}

              <Field label="新しいパスワード">
                <input
                  type="password"
                  required
                  minLength={MIN_LENGTH}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  className={inputClass}
                />
              </Field>
              <Field label="新しいパスワード（確認）">
                <input
                  type="password"
                  required
                  minLength={MIN_LENGTH}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-qz-sm bg-qz-accent text-qz-ink font-bold text-sm shadow-qz-sm hover:opacity-90 transition disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "保存中..." : "パスワードを変更する"}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => void cancelPasswordRecovery()}
                className="text-xs font-semibold text-qz-sub hover:text-qz-text hover:underline"
              >
                やめてログイン画面に戻る
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-qz-sub uppercase tracking-widest px-1 flex items-center gap-1.5">
        <KeyRound className="w-3 h-3" />
        {label}
      </label>
      {children}
    </div>
  );
}
