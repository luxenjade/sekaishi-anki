import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Landing } from "./features/landing/Landing";
import { NotFound } from "./features/landing/NotFound";
import type { SitePageId } from "./SitePages";

// アプリ本体（Supabase・グラフなど重い依存を含む）は /app を開いたときだけ読み込む
const AppRoot = lazy(() => import("./AppRoot"));
// About / FAQ / プライバシーポリシーも、開いたときだけ読み込む
const SitePages = lazy(() => import("./SitePages"));

const SITE_PAGE_ROUTES: Record<string, SitePageId> = {
  "/about": "about",
  "/faq": "faq",
  "/privacy-policy": "privacy-policy",
};

/** 末尾のスラッシュを除く（"/faq/" → "/faq"）。ルート "/" はそのまま */
function normalize(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function isAppPath(path: string): boolean {
  return path === "/app" || path.startsWith("/app/");
}

function Splash() {
  return (
    <div className="min-h-screen bg-qz-bg flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-qz-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Root() {
  const path = normalize(window.location.pathname);

  if (isAppPath(path)) {
    return (
      <Suspense fallback={<Splash />}>
        <AppRoot />
      </Suspense>
    );
  }
  if (path === "/" || path === "/index.html") return <Landing />;

  const sitePage = SITE_PAGE_ROUTES[path];
  if (sitePage) {
    return (
      <Suspense fallback={<Splash />}>
        <SitePages page={sitePage} />
      </Suspense>
    );
  }
  return <NotFound />;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
