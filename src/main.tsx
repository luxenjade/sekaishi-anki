import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Landing } from "./features/landing/Landing";
import { NotFound } from "./features/landing/NotFound";

// アプリ本体（Supabase・グラフなど重い依存を含む）は /app を開いたときだけ読み込む
const AppRoot = lazy(() => import("./AppRoot"));

function isAppPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/");
}

function isLandingPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/index.html";
}

function Splash() {
  return (
    <div className="min-h-screen bg-qz-bg flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-qz-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Root() {
  const { pathname } = window.location;

  if (isAppPath(pathname)) {
    return (
      <Suspense fallback={<Splash />}>
        <AppRoot />
      </Suspense>
    );
  }
  if (isLandingPath(pathname)) return <Landing />;
  return <NotFound />;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
