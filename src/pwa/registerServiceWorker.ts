/**
 * /app で service worker を登録する。
 * 開発中（vite dev）はキャッシュで挙動が分かりにくくなるので登録しない。
 * スコープは /app。紹介ページ（/）などは対象外。
 */
export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD) return;

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/app" })
      .catch((err) => console.error("Service worker registration failed:", err));
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
