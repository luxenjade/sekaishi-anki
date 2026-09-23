import { NotebookPen } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2 px-6 sticky top-0 z-40 transition-colors shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-base font-bold tracking-tight text-brand-blue flex items-center gap-2">
          <NotebookPen className="w-4 h-4" />
          sekaishi-anki
        </h1>
      </div>
    </header>
  );
}
