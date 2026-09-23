import { Calendar } from "lucide-react";

interface HeaderProps {
  showAbort: boolean;
  onAbort: () => void;
}

export function Header({ showAbort, onAbort }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2 px-6 sticky top-0 z-40 transition-colors shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-base font-bold tracking-tight text-brand-blue flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          sekaishi-anki
        </h1>

        <div className="flex items-center gap-3">
          {showAbort && (
            <button
              type="button"
              onClick={onAbort}
              className="text-xs font-bold tracking-wide px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-rose-500 transition"
            >
              中止
            </button>
          )}
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-500">
            JS
          </div>
        </div>
      </div>
    </header>
  );
}
