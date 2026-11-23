import { useCallback, useEffect, useState } from "react";

/** Chrome / Edge / Android のインストール用イベント（標準の型定義にまだ無い） */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function detectIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPadOS 13 以降は Mac を名乗るので、タッチ対応かどうかも見る
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // ブラウザ標準のミニバーを止め、自前のボタンから出す
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null); // 一度使ったイベントは再利用できない
  }, [deferred]);

  return {
    /** インストール用のダイアログを出せる（Chrome / Edge / Android） */
    canPrompt: deferred !== null,
    /** iOS の Safari など。手動で「ホーム画面に追加」する必要がある */
    isIos: detectIos(),
    /** すでにホーム画面のアプリとして開いている */
    isStandalone: detectStandalone() || installed,
    promptInstall,
  };
}
