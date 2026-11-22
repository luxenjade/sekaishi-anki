import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
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

function gradeOf(pct: number): { icon: string; message: string } {
  if (pct === 100) return { icon: "🏆", message: "全問正解！完璧です" };
  if (pct >= 80) return { icon: "🎉", message: "とてもよくできました" };
  if (pct >= 60)
    return { icon: "👍", message: "あと一歩。間違えた問題を復習しよう" };
  return { icon: "📚", message: "復習して、もう一度挑戦しよう" };
}

export function ResultScreen({
  mode,
  score,
  total,
  mistakes,
  onRetryMistakes,
  onFinish,
}: ResultScreenProps) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const { icon, message } = gradeOf(pct);

  // Enter で終了（フォーカス中のボタンの標準動作と二重にならないよう止める）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat || e.isComposing) return;
      e.preventDefault();
      onFinish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFinish]);

  return (
    <div className="w-full bg-qz-surface border border-qz-border rounded-qz-md sm:rounded-qz-lg shadow-qz-md p-5 sm:p-10 flex flex-col gap-6 animate-fadeIn">
      <div className="text-center py-4">
        <div className="text-5xl leading-none mb-3" aria-hidden>
          {icon}
        </div>
        <p className="text-[clamp(2.8rem,8vw,4rem)] font-bold leading-none text-qz-accent-text tabular-nums">
          {score}
          <span className="text-[0.5em] font-normal text-qz-sub">
            {" "}
            / {total}
          </span>
        </p>
        <p className="text-[1.4rem] font-semibold text-qz-sub mt-1 mb-2.5">
          {pct}%
        </p>
        <p className="text-base text-qz-sub">{message}</p>
      </div>

      <div className="flex justify-center gap-3">
        <StatTile label="正解" value={score} tone="correct" />
        <StatTile label="不正解" value={total - score} tone="incorrect" />
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        {mistakes.length > 0 && (
          <button
            type="button"
            onClick={onRetryMistakes}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-qz-sm bg-qz-accent text-qz-ink font-semibold hover:opacity-90 hover:-translate-y-px hover:shadow-qz-md active:scale-[0.98] transition"
          >
            <RotateCcw className="w-4 h-4" />
            間違えた問題だけ再挑戦
            <span className="inline-flex items-center justify-center rounded-full bg-white/25 px-2 text-xs font-bold">
              {mistakes.length}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={onFinish}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-qz-sm border border-qz-border text-qz-sub font-semibold hover:border-qz-accent hover:text-qz-text active:scale-[0.98] transition"
        >
          終了
          <kbd className="hidden sm:inline text-[10px] font-bold opacity-60 border border-current rounded px-1.5 py-0.5">
            Enter
          </kbd>
        </button>
      </div>

      {mistakes.length > 0 ? (
        <section className="pt-4 border-t border-qz-border">
          <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-qz-sub">
            復習リスト（{mistakes.length}）
          </h3>
          <p className="text-xs text-qz-sub mt-1">
            間違えた問題は自動で復習リストに追加されます。
          </p>
          <ul className="flex flex-col gap-2.5 mt-3">
            {mistakes.map(({ item, userAnswer }, i) => (
              <li
                key={`${item.id}-${i}`}
                className="px-3.5 py-3 rounded-qz-sm border border-qz-border border-l-[3px] border-l-qz-incorrect bg-qz-surface2"
              >
                <p className="text-[0.95rem] font-semibold text-qz-text mb-2">
                  {item.event}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className="text-qz-incorrect">
                    あなた:{" "}
                    <span className="line-through">
                      {userAnswer || "未回答"}
                    </span>
                  </span>
                  <span className="text-qz-correct">
                    正解:{" "}
                    <strong className="font-bold">
                      {mode === "event-to-year"
                        ? formatYear(item.year)
                        : item.event}
                    </strong>
                    {mode === "year-to-event" && (
                      <span className="opacity-80">
                        （{formatYear(item.year)}）
                      </span>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="p-8 text-center rounded-qz-md border-[1.5px] border-qz-correct bg-qz-correct-bg text-qz-correct font-semibold">
          全問正解！ミスはありませんでした
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "correct" | "incorrect";
}) {
  return (
    <div className="flex-1 max-w-[140px] px-3 py-3 text-center rounded-qz-md border border-qz-border bg-qz-surface2">
      <p
        className={`text-[1.8rem] font-bold leading-tight tabular-nums ${
          tone === "correct" ? "text-qz-correct" : "text-qz-incorrect"
        }`}
      >
        {value}
      </p>
      <p className="text-[0.78rem] text-qz-sub mt-1">{label}</p>
    </div>
  );
}
