import type { QuizMode } from "../../types/quiz";

interface StartScreenProps {
  mode: QuizMode;
  range: string;
  count: number | "all";
  loading?: boolean;
  rangeOptions: string[];
  rangeLabel?: string;
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
  onChangeMode,
  onChangeRange,
  onChangeCount,
  onStart,
}: StartScreenProps) {
  const defaultRangeLabel = mode === "event-to-year" ? "出題章" : "時代区分";

  return (
    <div className="w-full bg-qz-surface border border-qz-border rounded-qz-md sm:rounded-qz-lg shadow-qz-md p-5 sm:p-10 flex flex-col gap-6 animate-fadeIn">
      <div className="text-center pb-6 border-b border-qz-border">
        <h2 className="text-2xl sm:text-[1.6rem] font-bold text-qz-text mb-1.5">
          世界史年代クイズ
        </h2>
        <p className="text-sm text-qz-sub">
          出来事と年号（西暦）の対応を、双方向で効率よく暗記しよう
        </p>
      </div>

      <Block title="出題モード">
        <div className="grid grid-cols-2 gap-2.5">
          <ModeCard
            selected={mode === "event-to-year"}
            onClick={() => onChangeMode("event-to-year")}
            label="出来事 → 年号"
            sub="記述回答"
          />
          <ModeCard
            selected={mode === "year-to-event"}
            onClick={() => onChangeMode("year-to-event")}
            label="年号 → 出来事"
            sub="4択選択"
          />
        </div>
      </Block>

      <Block title={rangeLabel ?? defaultRangeLabel}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <RangeItem
            selected={range === "all"}
            onClick={() => onChangeRange("all")}
            label="すべての範囲から出題"
          />
          {rangeOptions.map((opt) => (
            <RangeItem
              key={opt}
              selected={range === opt}
              onClick={() => onChangeRange(opt)}
              label={opt}
            />
          ))}
        </div>
      </Block>

      <Block title="問題数">
        <div className="grid grid-cols-4 gap-2">
          {COUNTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeCount(c)}
              aria-pressed={count === c}
              className={`py-2.5 rounded-qz-sm border-[1.5px] text-sm font-semibold transition ${
                count === c
                  ? "border-qz-accent bg-qz-accent-light text-qz-text ring-[3px] ring-qz-accent-ring"
                  : "border-qz-border bg-qz-surface2 text-qz-sub hover:border-qz-accent"
              }`}
            >
              {c === "all" ? "全問" : `${c}問`}
            </button>
          ))}
        </div>
      </Block>

      <div className="flex justify-end pt-4 border-t border-qz-border">
        <button
          type="button"
          onClick={onStart}
          disabled={loading}
          className="w-full sm:w-auto sm:min-w-[160px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-qz-sm bg-qz-accent text-qz-ink font-semibold hover:opacity-90 hover:-translate-y-px hover:shadow-qz-md active:scale-[0.98] transition disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? "問題データを読み込み中..." : "クイズを開始する"}
          {!loading && <span aria-hidden>→</span>}
        </button>
      </div>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="pb-2 mb-1 border-b border-qz-border text-xs font-bold uppercase tracking-[0.06em] text-qz-sub">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ModeCard({
  selected,
  onClick,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-center justify-center gap-0.5 px-3 py-4 rounded-qz-md border-[1.5px] text-center transition ${
        selected
          ? "border-qz-accent bg-qz-accent-light ring-[3px] ring-qz-accent-ring"
          : "border-qz-border bg-qz-surface2 hover:border-qz-accent"
      }`}
    >
      <span className="text-sm font-bold text-qz-text">{label}</span>
      <span className="text-[11px] font-semibold text-qz-sub">{sub}</span>
    </button>
  );
}

function RangeItem({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-qz-sm border-[1.5px] text-left text-sm text-qz-text transition ${
        selected
          ? "border-qz-accent bg-qz-accent-light"
          : "border-qz-border bg-qz-surface2 hover:border-qz-accent"
      }`}
    >
      <span
        aria-hidden
        className={`shrink-0 w-3.5 h-3.5 rounded-full border-[1.5px] transition ${
          selected
            ? "border-qz-accent bg-qz-accent shadow-[inset_0_0_0_3px_var(--qz-surface)]"
            : "border-qz-border"
        }`}
      />
      <span className="leading-snug">{label}</span>
    </button>
  );
}
