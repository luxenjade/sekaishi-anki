import { useEffect } from "react";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { registerServiceWorker } from "./pwa/registerServiceWorker";

/** /app 配下のエントリ。認証コンテキストはアプリ本体でだけ必要なので、ここで包む */
export default function AppRoot() {
  useEffect(() => {
    document.title = "世界史年代暗記 | sekaishi-anki";
    // オフライン対応のための service worker（/app のみ）
    registerServiceWorker();
  }, []);

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
