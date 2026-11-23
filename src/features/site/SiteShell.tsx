import { useEffect } from "react";
import { Calendar, Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { SITE, SITE_PAGES } from "./siteInfo";

interface SiteShellProps {
  /** ページ名。指定するとタイトルが「ページ名 | sekaishi-anki」になる */
  title?: string;
  children: React.ReactNode;
}

/** 紹介ページ・About・FAQ・プライバシーポリシーで共通のヘッダーとフッター */
export function SiteShell({ title, children }: SiteShellProps) {
  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (title) document.title = `${title} | ${SITE.name}`;
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col bg-qz-bg text-qz-text font-sans">
      <header className="sticky top-0 z-40 bg-qz-surface/90 backdrop-blur border-b border-qz-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <a
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-qz-text"
          >
            <Calendar className="w-5 h-5 text-qz-accent-text" />
            {SITE.name}
          </a>

          <nav aria-label="サイト内" className="hidden md:flex items-center gap-5 text-sm">
            {SITE_PAGES.slice(0, 2).map((p) => (
              <a
                key={p.path}
                href={p.path}
                className="text-qz-sub hover:text-qz-text transition-colors"
              >
                {p.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "ライトモードにする" : "ダークモードにする"}
              className="w-9 h-9 rounded-full border border-qz-border text-qz-sub hover:border-qz-accent hover:text-qz-text flex items-center justify-center transition"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <a
              href="/app"
              className="inline-flex items-center px-4 py-2 rounded-qz-sm bg-qz-accent text-qz-ink text-sm font-semibold hover:opacity-90 transition"
            >
              アプリを開く
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-qz-border bg-qz-surface">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
          <nav
            aria-label="フッター"
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-qz-sub"
          >
            {SITE_PAGES.map((p) => (
              <a key={p.path} href={p.path} className="hover:text-qz-text hover:underline">
                {p.label}
              </a>
            ))}
            <a href="/app" className="hover:text-qz-text hover:underline">
              アプリを開く
            </a>
          </nav>
          <p className="text-xs text-qz-sub">
            © {SITE.operator} / {SITE.nameJa}
          </p>
        </div>
      </footer>
    </div>
  );
}
