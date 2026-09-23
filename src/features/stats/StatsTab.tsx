import { ArrowRight, BarChart3, History, PlayCircle, Trash2 } from "lucide-react";
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
  onRemoveReviewItem?: (id: string) => void;
}

export function StatsTab({
  reviewItems,
  categoryPerformance,
  onStartReview,
  onStartReviewOne,
  onRemoveReviewItem,
  totalLabel = "0",
  accuracyLabel = "0%",
  streakLabel = "0日",
  rankLabel = "見習い史家",
}: StatsTabProps) {
  return (
    <div className="w-full space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">統計</h2>
          <p className="text-xs font-bold text-slate-400 tracking-wide">
            学習の全体進捗
          </p>
        </div>
        <div className="px-3 py-1.5 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue rounded-lg text-xs font-bold tracking-wide border border-brand-blue/30 shrink-0">
          ランク: {rankLabel}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="解答数" value={totalLabel} />
        <StatCard label="正答率" value={accuracyLabel} accent="emerald" />
        <StatCard label="連続日数" value={streakLabel} accent="blue" />
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-brand-navy-light p-6 rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm space-y-6">
          <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-brand-blue" />
            カテゴリ別成績
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {categoryPerformance.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-zinc-300">
                    {item.label}
                  </span>
                  <span className="text-brand-blue">{item.val}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-brand-navy rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-blue rounded-full"
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-brand-navy-light p-6 rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-brand-blue" />
              復習リスト
            </h3>
            {reviewItems.length > 0 && (
              <button
                type="button"
                onClick={() => onStartReview(reviewItems)}
                className="text-xs font-bold text-brand-blue tracking-wide hover:underline flex items-center gap-1"
              >
                すべて復習する
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {reviewItems.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-6">
              復習リストは空です。クイズで間違えた問題がここに追加されます。
            </p>
          ) : (
            <div className="space-y-3">
              {reviewItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-navy border border-slate-100 dark:border-brand-slate/20"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-bold truncate">{item.event}</p>
                    <p className="text-xs font-bold text-slate-400">
                      {item.chapter} · {item.period}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onStartReviewOne(item)}
                      className="p-2 rounded-lg bg-white dark:bg-brand-navy-light border border-slate-200 dark:border-brand-slate/30 text-brand-blue hover:text-brand-sky shadow-sm active:scale-95 transition"
                      aria-label={`復習開始: ${item.event}`}
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                    {onRemoveReviewItem && (
                      <button
                        type="button"
                        onClick={() => onRemoveReviewItem(item.id)}
                        className="p-2 rounded-lg bg-white dark:bg-brand-navy-light border border-slate-200 dark:border-brand-slate/30 text-rose-500 hover:text-rose-600 shadow-sm active:scale-95 transition"
                        aria-label={`復習削除: ${item.event}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {reviewItems.length > 0 && (
            <button
              type="button"
              onClick={() => onStartReview(reviewItems)}
              className="w-full py-3 rounded-xl bg-brand-blue hover:bg-brand-sky text-white text-sm font-bold active:scale-[0.98] transition"
            >
              スマート復習を開始
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
  accent?: "emerald" | "blue";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-500"
      : accent === "blue"
        ? "text-brand-blue"
        : "";
  return (
    <div className="bg-white dark:bg-brand-navy-light p-4 rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm text-center">
      <p className="text-xs text-slate-400 font-bold mb-1">{label}</p>
      <p className={`text-xl font-black ${accentClass}`}>{value}</p>
    </div>
  );
}
