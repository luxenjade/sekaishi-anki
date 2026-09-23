import { ArrowRight, Award, RotateCcw } from "lucide-react";
import type { QuizMistake, QuizMode } from "../../types/quiz";
import { formatYear } from "../../lib/quiz";

interface ResultScreenProps {
  mode: QuizMode;
  score: number;
  total: number;
  mistakes: QuizMistake[];
  onRetryMistakes: () => void;
  onFinish: () => void;
}

export function ResultScreen({
  mode,
  score,
  total,
  mistakes,
  onRetryMistakes,
  onFinish,
}: ResultScreenProps) {
  const accuracy = total === 0 ? 0 : Math.round((score / total) * 100);

  return (
    <div className="w-full bg-white dark:bg-brand-navy-light rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm p-6 sm:p-8 space-y-8 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-blue/10 border-2 border-brand-blue/20 text-brand-blue">
          <Award className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">セッション完了</h2>
          <p className="text-xs text-slate-400 font-bold tracking-wide">
            成績分析
          </p>
        </div>

        <div className="inline-grid grid-cols-2 gap-px bg-slate-100 dark:bg-brand-navy border border-slate-100 dark:border-brand-slate/20 rounded-2xl overflow-hidden">
          <div className="bg-white dark:bg-brand-navy-light p-4 min-w-[120px]">
            <p className="text-xs text-slate-400 font-bold mb-1">スコア</p>
            <p className="text-3xl font-black text-brand-blue">
              {score}
              <span className="text-sm text-slate-300 ml-1">/{total}</span>
            </p>
          </div>
          <div className="bg-white dark:bg-brand-navy-light p-4 min-w-[120px]">
            <p className="text-xs text-slate-400 font-bold mb-1">正答率</p>
            <p className="text-3xl font-black text-emerald-500">
              {accuracy}
              <span className="text-sm text-slate-300 ml-1">%</span>
            </p>
          </div>
        </div>
      </div>

      {mistakes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 tracking-wide">
              復習リスト ({mistakes.length})
            </h3>
            {/*
              間違えた問題は App.tsx 側の useEffect で結果画面遷移時に
              自動的に復習リスト（review_items / localStorage）へ upsert される。
              以前ここにあった「Save to Review」ボタンは onClick 未配線で
              何も起きない死んだUIだったため削除し、代わりに自動保存済みである
              ことを明示するラベルに置き換えた。
            */}
            <span className="text-xs font-bold text-emerald-500 tracking-wide">
              自動保存済み
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {mistakes.map(({ item, userAnswer }, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 dark:bg-brand-navy border border-slate-100 dark:border-brand-slate/20 space-y-2"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                  {item.event}
                </p>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-rose-500 line-through opacity-60">
                    {userAnswer || "未回答"}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <span className="text-emerald-500 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-100 dark:border-emerald-900/30">
                    {mode === "event-to-year"
                      ? formatYear(item.year)
                      : item.event}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-2">
          <p className="text-2xl">🏆</p>
          <p className="font-black text-emerald-600 dark:text-emerald-400">
            全問正解！
          </p>
          <p className="text-xs text-emerald-500/80 font-bold tracking-wide">
            ミスはありません
          </p>
        </div>
      )}

      <div className="space-y-3 pt-2">
        {mistakes.length > 0 && (
          <button
            type="button"
            onClick={onRetryMistakes}
            className="w-full py-4 rounded-xl border border-brand-blue/40 bg-brand-blue/5 hover:bg-brand-blue/10 dark:bg-brand-blue/10 dark:hover:bg-brand-blue/20 text-brand-blue font-bold text-sm tracking-wide transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            間違えた問題だけ再挑戦
          </button>
        )}
        <button
          type="button"
          onClick={onFinish}
          className="w-full py-4 rounded-xl bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-zinc-200 font-bold text-sm tracking-wide transition shadow-md"
        >
          終了してスタートへ
        </button>
      </div>
    </div>
  );
}
