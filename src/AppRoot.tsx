import { useEffect } from "react";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

/** /app 配下のエントリ。認証コンテキストはアプリ本体でだけ必要なので、ここで包む */
export default function AppRoot() {
  useEffect(() => {
    document.title = "世界史年代暗記 | sekaishi-anki";
  }, []);

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
