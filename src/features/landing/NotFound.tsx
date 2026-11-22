export function NotFound() {
  return (
    <div className="min-h-screen bg-qz-bg text-qz-text font-sans flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold text-qz-accent-text">404</p>
      <p className="text-qz-sub">お探しのページは見つかりませんでした。</p>
      <div className="flex gap-3">
        <a
          href="/"
          className="px-6 py-3 rounded-qz-sm border border-qz-border text-qz-sub font-semibold hover:border-qz-accent hover:text-qz-text transition"
        >
          トップへ
        </a>
        <a
          href="/app"
          className="px-6 py-3 rounded-qz-sm bg-qz-accent text-qz-ink font-semibold hover:opacity-90 transition"
        >
          アプリを開く
        </a>
      </div>
    </div>
  );
}
