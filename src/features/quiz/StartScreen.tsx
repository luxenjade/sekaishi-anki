import type { QuizMode } from "../../types/quiz";
import { chapters, periods } from "../../data/mockEvents";

interface StartScreenProps {
  mode: QuizMode;
  range: string;
  count: number | "all";
  onChangeMode: (m: QuizMode) => void;
  onChangeRange: (r: string) => void;
  onChangeCount: (c: number | "all") => void;
  onStart: () => void;
}

const COUNTS: (number | "all")[] = [5, 10, 20, "all"];

export function StartScreen({
  mode,
  range,
  count,
  onChangeMode,
  onChangeRange,
  onChangeCount,
  onStart,
}: StartScreenProps) {
  const rangeOptions = mode === "event-to-year" ? chapters : periods;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
          New Session
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          学習を開始
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          出来事と年号（西暦）の対応を効率よく暗記するためのスマート学習クイズです。
        </p>
      </div>

      {/* モード選択 */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          Mode Selection
        </label>
        <div className="grid grid-cols-2 gap-3">
          <ModeButton
            active={mode === "event-to-year"}
            onClick={() => onChangeMode("event-to-year")}
            label="出来事 ➔ 年号"
            sub="記述回答"
          />
          <ModeButton
            active={mode === "year-to-event"}
            onClick={() => onChangeMode("year-to-event")}
            label="年号 ➔ 出来事"
            sub="4択選択"
          />
        </div>
      </div>

      {/* 範囲選択 */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          {mode === "event-to-year" ? "Chapter Range" : "Period Range"}
        </label>
        <select
          value={range}
          onChange={(e) => onChangeRange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-transparent transition appearance-none cursor-pointer"
        >
          <option value="all">すべての範囲から出題</option>
          {rangeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* 問題数 */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          Question Count
        </label>
        <div className="grid grid-cols-4 gap-2">
          {COUNTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeCount(c)}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition ${
                count === c
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-400"
                  : "border-slate-200 dark:border-zinc-800 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
              }`}
            >
              {c === "all" ? "全問" : `${c}問`}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
      >
        クイズを開始する
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}

interface ModeButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}

function ModeButton({ active, onClick, label, sub }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
        active
          ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/10 text-slate-900 dark:text-zinc-50 shadow-sm ring-1 ring-amber-400"
          : "border-slate-200 dark:border-zinc-800 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
      }`}
    >
      <span className="font-bold text-sm">{label}</span>
      <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
        {sub}
      </span>
    </button>
  );
}
