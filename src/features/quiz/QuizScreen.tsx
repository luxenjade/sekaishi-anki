import { useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";
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
    <div className="w-full bg-qz-surface border border-qz-border rounded-qz-md sm:rounded-qz-lg shadow-qz-md p-5 sm:p-10 space-y-5 animate-fadeIn">
      {/* 進捗バー + 中止ボタン */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAbort}
          aria-label="クイズを中止"
          title="クイズを中止"
          className="shrink-0 w-9 h-9 rounded-full border border-qz-border text-qz-sub hover:border-qz-incorrect hover:text-qz-incorrect flex items-center justify-center transition active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1 h-[5px] bg-qz-border rounded-[3px] overflow-hidden">
          <div
            className="h-full bg-qz-accent rounded-[3px] transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="shrink-0 min-w-[48px] text-right text-xs font-semibold text-qz-sub tabular-nums whitespace-nowrap">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {/* 問題 */}
      <div className="flex flex-col items-center gap-3 text-center pt-2">
        {mode === "event-to-year" ? (
          <>
            <h3 className="max-w-[640px] text-[clamp(1.3rem,4vw,1.7rem)] font-bold leading-snug text-qz-text">
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
            <CategoryChip>{current.period}</CategoryChip>
            <h3 className="text-[clamp(2.4rem,9vw,3.4rem)] font-bold leading-none tracking-tight text-qz-accent-text">
              {formatYear(current.year)}
            </h3>
          </>
        )}
      </div>

      {/* 回答欄 */}
      {mode === "event-to-year" ? (
        !hasAnswered && (
          <TextAnswerForm onSubmit={onTextAnswer} error={validationError} />
        )
      ) : (
        <ChoiceList
          choices={choices}
          answered={hasAnswered}
          selected={selectedChoice}
          correct={current.event}
          onSelect={onChoiceSelect}
        />
      )}

      {/* フィードバック */}
      {hasAnswered && (
        <Feedback
          mode={mode}
          isCorrect={isCorrect}
          current={current}
          userAnswerText={userAnswerText}
          selectedChoice={selectedChoice}
        />
      )}

      {hasAnswered && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onNext}
            autoFocus
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-qz-sm bg-qz-accent text-qz-ink font-semibold hover:opacity-90 hover:-translate-y-px hover:shadow-qz-md active:scale-[0.98] transition"
          >
            {isLast ? "結果を見る" : "次の問題へ"}
            <ChevronRight className="w-4 h-4" />
            <kbd className="hidden sm:inline text-[10px] font-bold opacity-60 border border-current rounded px-1.5 py-0.5">
              Enter
            </kbd>
          </button>
        </div>
      )}
    </div>
  );
}

// ======================================================================
// チップ・付加情報（章・テーマ・タグ・説明）
// ======================================================================

function CategoryChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block max-w-full px-3 py-[3px] border-[1.5px] border-qz-accent rounded-full bg-qz-accent-light text-xs font-bold leading-snug tracking-wide text-qz-accent-text">
      {children}
    </span>
  );
}

function SubChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block max-w-full px-2 py-[2px] rounded-qz-sm border border-qz-border bg-qz-surface2 text-[11px] font-semibold leading-snug text-qz-sub">
      {children}
    </span>
  );
}

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
        <CategoryChip>{item.chapter}</CategoryChip>
        {themeLabel && <SubChip>{themeLabel}</SubChip>}
        {tags.map((t) => (
          <SubChip key={t}>#{tagLabel(t)}</SubChip>
        ))}
      </div>
      {showDescription && item.description && (
        <p className="max-w-[560px] mx-auto text-sm leading-relaxed italic text-qz-sub">
          {item.description}
        </p>
      )}
    </div>
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
      className="flex flex-col items-center gap-3"
    >
      <div
        role="group"
        aria-label="西暦か紀元前か"
        className="grid grid-cols-2 gap-2 w-full max-w-[260px]"
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
            className={`py-2 rounded-qz-sm border-[1.5px] text-sm font-medium transition ${
              isBc === bc
                ? "border-qz-accent bg-qz-accent-light text-qz-text ring-[3px] ring-qz-accent-ring"
                : "border-qz-border bg-qz-surface2 text-qz-sub hover:border-qz-accent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {isBc && <span className="text-lg font-bold text-qz-sub">前</span>}
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
          className="w-[180px] max-[600px]:w-[150px] px-4 py-3 rounded-qz-md border-2 border-qz-border bg-qz-surface text-qz-text text-center text-[1.4rem] max-[600px]:text-[1.2rem] font-bold tabular-nums outline-none transition focus:border-qz-accent focus:ring-[3px] focus:ring-qz-accent-ring placeholder:text-qz-border"
        />
        <span className="text-lg font-bold text-qz-sub">年</span>
      </div>

      <p className="min-h-[1.2em] text-[0.82rem] text-qz-incorrect text-center">
        {shownError}
      </p>

      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-3 rounded-qz-sm bg-qz-accent text-qz-ink font-semibold hover:opacity-90 hover:-translate-y-px hover:shadow-qz-md active:scale-[0.98] transition"
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
// 4択（回答後も選択肢を残し、正解・不正解を色で示す）
// ======================================================================

interface ChoiceListProps {
  choices: string[];
  answered: boolean;
  selected: string | null;
  correct: string;
  onSelect: (c: string) => void;
}

function ChoiceList({
  choices,
  answered,
  selected,
  correct,
  onSelect,
}: ChoiceListProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {choices.map((choice, i) => {
        const isRight = choice === correct;
        const isWrongPick = answered && choice === selected && !isRight;

        const stateClass = !answered
          ? "border-qz-border bg-qz-surface2 text-qz-text hover:border-qz-accent hover:bg-qz-accent-light hover:translate-x-[3px] active:scale-[0.99]"
          : isRight
            ? "border-qz-correct bg-qz-correct-bg text-qz-correct cursor-default"
            : isWrongPick
              ? "border-qz-incorrect bg-qz-incorrect-bg text-qz-incorrect cursor-default"
              : "border-qz-border bg-qz-surface2 text-qz-text opacity-60 cursor-default";

        const letterClass = !answered
          ? "bg-qz-border text-qz-sub group-hover:bg-qz-accent group-hover:text-qz-ink"
          : isRight
            ? "bg-qz-correct text-white"
            : isWrongPick
              ? "bg-qz-incorrect text-white"
              : "bg-qz-border text-qz-sub";

        return (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => onSelect(choice)}
            className={`group w-full flex items-center gap-3 px-4 py-3 max-[600px]:px-3 rounded-qz-md border-[1.5px] text-left text-[0.95rem] max-[600px]:text-[0.9rem] transition ${stateClass}`}
          >
            <span
              className={`shrink-0 w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-bold tabular-nums transition ${letterClass}`}
            >
              {i + 1}
            </span>
            <span className="flex-1 leading-snug">{choice}</span>
          </button>
        );
      })}
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
}

function Feedback({
  mode,
  isCorrect,
  current,
  userAnswerText,
  selectedChoice,
}: FeedbackProps) {
  // 「-221」→「前221年」の形で見せる
  const parsed = parseYearInput(userAnswerText);
  const userLabel =
    mode === "event-to-year"
      ? parsed !== null
        ? formatYear(parsed)
        : userAnswerText || "未入力"
      : selectedChoice;

  const correctLabel =
    mode === "event-to-year" ? formatYear(current.year) : current.event;

  return (
    <div className="space-y-3 animate-scaleUp">
      <div
        className={`px-5 py-4 rounded-qz-md border-[1.5px] ${
          isCorrect
            ? "bg-qz-correct-bg border-qz-correct text-qz-correct"
            : "bg-qz-incorrect-bg border-qz-incorrect text-qz-incorrect"
        }`}
      >
        <p className="flex items-center gap-2 font-bold">
          <span aria-hidden className="text-lg leading-none">
            {isCorrect ? "✓" : "✗"}
          </span>
          {isCorrect ? "正解！" : "不正解"}
        </p>
        {isCorrect ? (
          <p className="mt-1 text-sm opacity-90">
            {formatYear(current.year)} ➔ {current.event}
          </p>
        ) : (
          <div className="mt-1 space-y-0.5 text-sm">
            <p className="opacity-90">
              あなたの回答: <span className="line-through">{userLabel}</span>
            </p>
            <p>
              正解: <strong className="font-bold">{correctLabel}</strong>
              {mode === "year-to-event" && (
                <span className="opacity-80">
                  （{formatYear(current.year)}）
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* 回答後は答えが分かっているので、説明も含めて全部見せる */}
      <div className="rounded-qz-md border border-qz-border bg-qz-surface2 px-4 py-3">
        <QuestionMeta item={current} showDescription />
      </div>
    </div>
  );
}
