import { ArrowRight, BarChart3, History, PlayCircle } from "lucide-react";
import type { HistoryQuizItem } from "../../types/quiz";

interface StatsTabProps {
  reviewItems: HistoryQuizItem[];
  categoryPerformance: { label: string; val: number; era: string }[];
  /** 復習リストからクイズを起動するコールバック */
  onStartReview: (items: HistoryQuizItem[]) => void;
  /** 個別の復習問題を即座にクイズ形式で開始 */
  onStartReviewOne: (item: HistoryQuizItem) => void;
  totalLabel?: string;
  accuracyLabel?: string;
  streakLabel?: string;
  rankLabel?: string;
}

export function StatsTab({
  reviewItems,
  categoryPerformance,
  onStartReview,
  onStartReviewOne,
  totalLabel = "1.2k",
  accuracyLabel = "84%",
  streakLabel = "12d",
  rankLabel = "Elite",
}: StatsTabProps) {
  return (
    <div className="w-full space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Statistics</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Overall Learning Progress
          </p>
        </div>
        <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-amber-200 dark:border-amber-900/30">
          Rank: {rankLabel}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={totalLabel} />
        <StatCard label="Accuracy" value={accuracyLabel} accent="emerald" />
        <StatCard label="Streak" value={streakLabel} accent="amber" />
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            Category Performance
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {categoryPerformance.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-600 dark:text-zinc-300">
                    {item.label}
                  </span>
                  <span className="text-amber-500">{item.val}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-rose-500" />
              Review Queue
            </h3>
            {reviewItems.length > 0 && (
              <button
                type="button"
                onClick={() => onStartReview(reviewItems)}
                className="text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                すべて復習する
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {reviewItems.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium text-center py-6">
              復習リストは空です。クイズで間違えた問題がここに追加されます。
            </p>
          ) : (
            <div className="space-y-3">
              {reviewItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold truncate">{item.event}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {item.chapter} · {item.period}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartReviewOne(item)}
                    className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-amber-500 shadow-sm active:scale-95 transition"
                    aria-label={`復習開始: ${item.event}`}
                  >
                    <PlayCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {reviewItems.length > 0 && (
            <button
              type="button"
              onClick={() => onStartReview(reviewItems)}
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/20 active:scale-[0.98] transition"
            >
              Start Smart Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "amber";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-500"
      : accent === "amber"
        ? "text-amber-500"
        : "";
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
        {label}
      </p>
      <p className={`text-xl font-black ${accentClass}`}>{value}</p>
    </div>
  );
}
