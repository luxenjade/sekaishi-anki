import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, X, XCircle } from "lucide-react";
import type { HistoryQuizItem, QuizMode } from "../../types/quiz";
import { choiceLabel, formatYear } from "../../lib/quiz";

interface QuizScreenProps {
  mode: QuizMode;
  items: HistoryQuizItem[];
  currentIndex: number;
  choices: string[];
  hasAnswered: boolean;
  isCorrect: boolean;
  selectedChoice: string | null;
  userAnswerText: string;
  validationError: string | null;
  progress: number;
  onTextAnswer: (input: string) => void;
  onChoiceSelect: (choice: string) => void;
  onNext: () => void;
  onAbort: () => void;
}

export function QuizScreen({
  mode,
  items,
  currentIndex,
  choices,
  hasAnswered,
  isCorrect,
  selectedChoice,
  userAnswerText,
  validationError,
  progress,
  onTextAnswer,
  onChoiceSelect,
  onNext,
  onAbort,
}: QuizScreenProps) {
  const [draft, setDraft] = useState(userAnswerText);
  const current = items[currentIndex];

  // 問題が切り替わったら draft をリセット
  useEffect(() => {
    setDraft("");
  }, [currentIndex]);

  if (!current) return null;
  const isLast = currentIndex + 1 >= items.length;
  const chapterOrPeriod =
    mode === "event-to-year" ? current.chapter : current.period;

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onAbort}
            className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl border border-slate-200 dark:border-brand-slate/40 bg-white dark:bg-brand-navy-light text-sm font-bold text-slate-600 dark:text-zinc-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 active:scale-[0.98] transition shadow-sm"
          >
            <X className="w-4 h-4" aria-hidden />
            クイズを中止
          </button>
          <div className="text-right min-w-0">
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 truncate">
              {chapterOrPeriod}
            </p>
            <p className="text-sm font-black text-brand-blue tabular-nums">
              {currentIndex + 1}
              <span className="text-slate-300 dark:text-zinc-600 font-bold">
                {" "}
                /{" "}
              </span>
              {items.length}
            </p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-brand-navy rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-blue rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-brand-navy-light rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold tracking-wide text-brand-blue">
            {mode === "event-to-year"
              ? "問題: 出来事 → 年代"
              : "問題: 年代 → 出来事"}
          </span>
          {mode === "event-to-year" ? (
            <h3 className="text-xl sm:text-2xl font-bold leading-relaxed py-4 text-slate-900 dark:text-zinc-100">
              {current.event}
            </h3>
          ) : (
            <h3 className="text-4xl sm:text-5xl font-black tracking-tighter py-4 text-brand-blue">
              {formatYear(current.year)}
            </h3>
          )}
        </div>

        {!hasAnswered ? (
          mode === "event-to-year" ? (
            <TextAnswerForm
              draft={draft}
              onChange={(v) => {
                setDraft(v);
              }}
              onSubmit={() => onTextAnswer(draft)}
              error={validationError}
            />
          ) : (
            <ChoiceList choices={choices} onSelect={onChoiceSelect} />
          )
        ) : (
          <Feedback
            mode={mode}
            isCorrect={isCorrect}
            current={current}
            userAnswerText={userAnswerText}
            selectedChoice={selectedChoice}
            isLast={isLast}
            onNext={onNext}
          />
        )}
      </div>
    </div>
  );
}

interface TextAnswerFormProps {
  draft: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  error: string | null;
}

function TextAnswerForm({
  draft,
  onChange,
  onSubmit,
  error,
}: TextAnswerFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="-?[0-9]*"
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            placeholder="例: 1789, -221"
            autoFocus
            className="flex-1 px-4 py-4 rounded-xl border border-slate-200 dark:border-brand-slate/30 bg-slate-50 dark:bg-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue text-center font-bold text-xl tracking-widest"
          />
          <button
            type="submit"
            className="px-6 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold transition-all active:scale-[0.98]"
          >
            解答
          </button>
        </div>
        {error && (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold text-center">
            {error}
          </p>
        )}
        <p className="text-xs text-slate-400 text-center font-semibold tracking-wide">
          ※ 紀元前はマイナス記号 ( - ) をつけて入力
        </p>
      </div>
    </form>
  );
}

interface ChoiceListProps {
  choices: string[];
  onSelect: (c: string) => void;
}

function ChoiceList({ choices, onSelect }: ChoiceListProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {choices.map((choice, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(choice)}
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-brand-slate/30 bg-slate-50 hover:bg-slate-100 dark:bg-brand-navy dark:hover:bg-brand-navy-light dark:hover:border-brand-slate/40 text-left font-bold text-sm transition-all hover:translate-x-1 active:translate-x-0 duration-150 text-slate-700 dark:text-zinc-200 flex items-start gap-4"
        >
          <span className="w-6 h-6 rounded-lg bg-white dark:bg-brand-navy border border-slate-200 dark:border-brand-slate/30 flex items-center justify-center text-xs text-slate-400 shrink-0 shadow-sm">
            {choiceLabel(i)}
          </span>
          <span className="leading-tight">{choice}</span>
        </button>
      ))}
    </div>
  );
}

interface FeedbackProps {
  mode: QuizMode;
  isCorrect: boolean;
  current: HistoryQuizItem;
  userAnswerText: string;
  selectedChoice: string | null;
  isLast: boolean;
  onNext: () => void;
}

function Feedback({
  mode,
  isCorrect,
  current,
  userAnswerText,
  selectedChoice,
  isLast,
  onNext,
}: FeedbackProps) {
  return (
    <div className="space-y-4 animate-scaleUp">
      {isCorrect ? (
        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">正解！</p>
            <p className="text-xs opacity-90 leading-relaxed">
              正解: {formatYear(current.year)} ➔ {current.event}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/10 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">不正解...</p>
            <div className="text-xs opacity-90 space-y-1">
              <p>
                あなたの回答:{" "}
                <span className="line-through font-semibold text-rose-500">
                  {mode === "event-to-year"
                    ? userAnswerText || "未入力"
                    : selectedChoice}
                </span>
              </p>
              <p className="text-sm font-bold text-rose-900 dark:text-rose-100 mt-2">
                正解:{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {mode === "event-to-year"
                    ? formatYear(current.year)
                    : current.event}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full py-4 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold transition flex items-center justify-center gap-1 text-sm shadow-lg active:scale-[0.98]"
      >
        {isLast ? "結果を見る" : "次の問題へ"}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
