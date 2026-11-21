import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, X, XCircle } from "lucide-react";
import type { HistoryQuizItem, QuizMode } from "../../types/quiz";
import { formatYear, parseYearInput } from "../../lib/quiz";
import { THEME_LABEL, tagLabel } from "../../lib/taxonomy";

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
  /** クイズを中止してスタート画面へ戻る（確認ダイアログは呼び出し側） */
  onAbort: () => void;
}

/** 説明文に年号（3桁以上の数字）が含まれていると、答えが見えてしまう */
function descriptionRevealsYear(description: string): boolean {
  return /[0-9０-９]{3,}/.test(description);
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
  const current = items[currentIndex];

  // 回答後は Enter で次の問題へ（長押しのリピートは無視）
  useEffect(() => {
    if (!hasAnswered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat || e.isComposing) return;
      // フォーカス中のボタンの標準動作（クリック）と二重に発火しないようにする
      e.preventDefault();
      onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasAnswered, onNext]);

  // 4択は数字キー 1〜4 でも選べる
  useEffect(() => {
    if (mode !== "year-to-event" || hasAnswered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= choices.length) {
        e.preventDefault();
        onChoiceSelect(choices[n - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, hasAnswered, choices, onChoiceSelect]);

  if (!current) return null;
  const isLast = currentIndex + 1 >= items.length;

  return (
    <div className="w-full space-y-5 animate-fadeIn">
      {/* 上部バー: 中止ボタン + 進捗 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAbort}
          aria-label="クイズを中止"
          title="クイズを中止"
          className="shrink-0 w-10 h-10 rounded-full border border-slate-200 dark:border-brand-slate/30 bg-white dark:bg-brand-navy-light text-slate-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-900/50 flex items-center justify-center transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 h-2 bg-slate-200 dark:bg-brand-navy rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-blue rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-bold text-brand-blue tabular-nums">
          {currentIndex + 1}
          <span className="text-slate-300 dark:text-zinc-700"> / </span>
          {items.length}
        </span>
      </div>

      <div className="bg-white dark:bg-brand-navy-light rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm p-5 sm:p-8 space-y-6">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">
            {mode === "event-to-year"
              ? "Question: Event to Year"
              : "Question: Year to Event"}
          </span>

          {mode === "event-to-year" ? (
            <>
              <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-slate-900 dark:text-zinc-100">
                {current.event}
              </h3>
              {/* 出来事→年号では、分類は答えを見せないヒントになる */}
              {!hasAnswered && (
                <QuestionMeta
                  item={current}
                  showDescription={
                    !!current.description &&
                    !descriptionRevealsYear(current.description)
                  }
                />
              )}
            </>
          ) : (
            <>
              <h3 className="text-4xl sm:text-5xl font-black tracking-tighter py-2 text-brand-blue">
                {formatYear(current.year)}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {current.period}
              </p>
            </>
          )}
        </div>

        {!hasAnswered ? (
          mode === "event-to-year" ? (
            <TextAnswerForm onSubmit={onTextAnswer} error={validationError} />
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

// ======================================================================
// 問題の付加情報（章・テーマ・タグ・説明）
// ======================================================================

function QuestionMeta({
  item,
  showDescription,
}: {
  item: HistoryQuizItem;
  showDescription: boolean;
}) {
  const themeLabel = item.theme ? THEME_LABEL[item.theme] : null;
  const tags = item.tags ?? [];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Chip tone="brand">{item.chapter}</Chip>
        {themeLabel && <Chip tone="amber">{themeLabel}</Chip>}
        {tags.map((t) => (
          <Chip key={t} tone="muted">
            #{tagLabel(t)}
          </Chip>
        ))}
      </div>
      {showDescription && item.description && (
        <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
          {item.description}
        </p>
      )}
    </div>
  );
}

function Chip({
  tone,
  children,
}: {
  tone: "brand" | "amber" | "muted";
  children: React.ReactNode;
}) {
  const toneClass = {
    brand: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    amber:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    muted:
      "bg-slate-100 dark:bg-brand-navy text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-brand-slate/30",
  }[tone];
  return (
    <span
      className={`inline-block max-w-full px-2 py-0.5 rounded-md border text-[10px] font-bold leading-snug ${toneClass}`}
    >
      {children}
    </span>
  );
}

// ======================================================================
// 記述回答（スマホではテンキー）
// ======================================================================

/** 全角数字を半角にし、数字以外を除去して4桁までにする */
function toDigits(value: string): string {
  return value
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\D/g, "")
    .slice(0, 4);
}

interface TextAnswerFormProps {
  onSubmit: (input: string) => void;
  error: string | null;
}

/**
 * iOS のテンキーにはマイナス記号がないため、
 * 数字だけを入力欄に入れ、紀元前は「西暦 / 紀元前」の切り替えで指定する。
 * 問題ごとに作り直されるので、毎回「西暦」から始まる。
 */
function TextAnswerForm({ onSubmit, error }: TextAnswerFormProps) {
  const [digits, setDigits] = useState("");
  const [isBc, setIsBc] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = () => {
    if (digits === "") {
      setLocalError("年を数字で入力してください。");
      return;
    }
    setLocalError(null);
    onSubmit(`${isBc ? "-" : ""}${digits}`);
  };

  const shownError = localError ?? error;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
    >
      <div
        role="group"
        aria-label="西暦か紀元前か"
        className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-brand-navy border border-slate-200 dark:border-brand-slate/30"
      >
        {(
          [
            [false, "西暦"],
            [true, "紀元前"],
          ] as [boolean, string][]
        ).map(([bc, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => setIsBc(bc)}
            aria-pressed={isBc === bc}
            className={`py-2.5 rounded-lg text-sm font-bold transition ${
              isBc === bc
                ? "bg-white dark:bg-brand-navy-light text-brand-blue shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {isBc && (
          <span className="shrink-0 text-lg font-black text-slate-400">前</span>
        )}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="done"
          autoComplete="off"
          autoFocus
          maxLength={4}
          value={digits}
          onChange={(e) => {
            setDigits(toDigits(e.target.value));
            setLocalError(null);
          }}
          placeholder="1789"
          aria-label="年"
          className="flex-1 min-w-0 px-4 py-4 rounded-xl border border-slate-200 dark:border-brand-slate/30 bg-slate-50 dark:bg-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue text-center font-black text-3xl tracking-widest tabular-nums"
        />
        <span className="shrink-0 text-lg font-black text-slate-400">年</span>
      </div>

      {shownError && (
        <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold text-center">
          {shownError}
        </p>
      )}

      <button
        type="submit"
        className="w-full py-4 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        確定
        <kbd className="hidden sm:inline text-[10px] font-bold opacity-60 border border-current rounded px-1.5 py-0.5">
          Enter
        </kbd>
      </button>
    </form>
  );
}

// ======================================================================
// 4択
// ======================================================================

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
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-brand-slate/30 bg-slate-50 hover:bg-slate-100 dark:bg-brand-navy dark:hover:bg-brand-navy-light dark:hover:border-brand-slate/40 text-left font-bold text-sm transition-all active:scale-[0.99] duration-150 text-slate-700 dark:text-zinc-200 flex items-start gap-4"
        >
          <span className="w-6 h-6 rounded-lg bg-white dark:bg-brand-navy border border-slate-200 dark:border-brand-slate/30 flex items-center justify-center text-[11px] text-slate-400 shrink-0 shadow-sm tabular-nums">
            {i + 1}
          </span>
          <span className="leading-snug">{choice}</span>
        </button>
      ))}
    </div>
  );
}

// ======================================================================
// 回答後のフィードバック
// ======================================================================

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
  // 「-221」→「前221年」の形で見せる
  const parsed = parseYearInput(userAnswerText);
  const userLabel =
    mode === "event-to-year"
      ? parsed !== null
        ? formatYear(parsed)
        : userAnswerText || "未入力"
      : selectedChoice;

  return (
    <div className="space-y-4 animate-scaleUp">
      {isCorrect ? (
        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">Excellent!</p>
            <p className="text-xs opacity-90 leading-relaxed">
              正解: {formatYear(current.year)} ➔ {current.event}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/10 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">Not quite...</p>
            <div className="text-xs opacity-90 space-y-1">
              <p>
                あなたの回答:{" "}
                <span className="line-through font-semibold text-rose-500">
                  {userLabel}
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

      {/* 回答後は答えが分かっているので、説明も含めて全部見せる */}
      <QuestionMeta item={current} showDescription />

      <button
        type="button"
        onClick={onNext}
        autoFocus
        className="w-full py-4 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold transition flex items-center justify-center gap-2 text-sm shadow-lg active:scale-[0.98]"
      >
        {isLast ? "結果を見る" : "次の問題へ"}
        <ChevronRight className="w-4 h-4" />
        <kbd className="hidden sm:inline text-[10px] font-bold opacity-60 border border-current rounded px-1.5 py-0.5">
          Enter
        </kbd>
      </button>
    </div>
  );
}
