import { AlertTriangle } from "lucide-react";
import type { QuizMode } from "../../types/quiz";

interface StartScreenProps {
  mode: QuizMode;
  range: string;
  count: number | "all";
  loading?: boolean;
  rangeOptions: string[];
  rangeLabel?: string;
  /**
   * true の場合、Supabase は設定済みだが問い合わせが失敗/空だったために
   * モックデータへフォールバックしている状態。これは「意図的なデモモード」とは
   * 区別すべき異常系なので、目立つ警告として表示する。
   * (意図的なデモモード = Supabase未設定 でAuthScreenの「デモモードで続行」を
   * 選んだ場合。この場合は isSynced=false のバッジで足りるため、ここでは警告しない)
   */
  showUnexpectedFallbackWarning?: boolean;
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
  loading = false,
  rangeOptions,
  rangeLabel,
  showUnexpectedFallbackWarning = false,
  onChangeMode,
  onChangeRange,
  onChangeCount,
  onStart,
}: StartScreenProps) {
  const defaultRangeLabel = mode === "event-to-year" ? "出題地域" : "時代区分";

  return (
    <div className="w-full bg-white dark:bg-brand-navy-light rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue dark:text-brand-sky border border-brand-blue/20 dark:border-brand-blue/30">
          New Session
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          学習を開始
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          出来事と年号（西暦）の対応を効率よく暗記するためのスマート学習クイズです。
        </p>
      </div>

      {showUnexpectedFallbackWarning && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <p className="font-bold">
              本番データベースへの接続に失敗しています
            </p>
            <p className="opacity-90">
              Supabase は設定済みですが wh_dates
              の取得に失敗、または結果が空だったため、一時的にサンプル問題で表示しています。ネットワークやデータベースの状態を確認してください。
            </p>
          </div>
        </div>
      )}

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
          {rangeLabel ?? defaultRangeLabel}
        </label>
        <select
          value={range}
          onChange={(e) => onChangeRange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-brand-slate/30 bg-slate-50 dark:bg-brand-navy text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition appearance-none cursor-pointer"
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
                  ? "border-brand-blue bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue"
                  : "border-slate-200 dark:border-brand-slate/30 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-brand-navy-light dark:hover:text-zinc-200"
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
        disabled={loading}
        className="w-full py-4 rounded-xl bg-brand-blue hover:bg-brand-sky active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? "問題データを読み込み中..." : "クイズを開始する"}
        {!loading && <span aria-hidden>→</span>}
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
          ? "border-brand-blue bg-brand-blue/10 text-slate-900 dark:text-zinc-50 shadow-sm ring-1 ring-brand-blue"
          : "border-slate-200 dark:border-brand-slate/30 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-brand-navy-light dark:hover:text-zinc-200"
      }`}
    >
      <span className="font-bold text-sm">{label}</span>
      <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
        {sub}
      </span>
    </button>
  );
}
