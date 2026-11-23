import { useState } from "react";
import { Download, Share, WifiOff, X } from "lucide-react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

const DISMISS_KEY = "sekaishi-install-dismissed";

/** ホーム画面への追加を案内するバナー。閉じたら二度と出さない */
export function InstallBanner() {
  const { canPrompt, isIos, isStandalone, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (isStandalone || dismissed) return null;
  if (!canPrompt && !isIos) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* 保存できなくても、このセッション中は閉じたままにする */
    }
  };

  return (
    <div
      role="region"
      aria-label="ホーム画面に追加"
      className="mb-4 flex items-start gap-3 p-3.5 rounded-qz-md border border-qz-accent bg-qz-accent-light"
    >
      <div className="mt-0.5 shrink-0 w-8 h-8 rounded-qz-sm bg-qz-accent text-qz-ink flex items-center justify-center">
        {canPrompt ? <Download className="w-4 h-4" /> : <Share className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0 text-sm">
        <p className="font-bold text-qz-text">ホーム画面に追加できます</p>
        {canPrompt ? (
          <p className="text-qz-sub mt-0.5">
            アプリのようにすぐ開けて、全画面で使えます。
          </p>
        ) : (
          <p className="text-qz-sub mt-0.5">
            Safari の共有ボタンから「ホーム画面に追加」を選ぶと、アプリのように使えます。
          </p>
        )}
        {canPrompt && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="mt-2 px-4 py-1.5 rounded-qz-sm bg-qz-accent text-qz-ink text-sm font-semibold hover:opacity-90 transition"
          >
            インストール
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="閉じる"
        className="shrink-0 w-7 h-7 rounded-full text-qz-sub hover:text-qz-text flex items-center justify-center transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/** オフライン中の案内 */
export function OfflineBanner() {
  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-2.5 p-3 rounded-qz-md border border-qz-border bg-qz-surface2 text-sm text-qz-sub"
    >
      <WifiOff className="w-4 h-4 mt-0.5 shrink-0" />
      <p>
        オフラインです。保存済みの問題で解答できますが、成績や復習リストは保存されません。
      </p>
    </div>
  );
}
