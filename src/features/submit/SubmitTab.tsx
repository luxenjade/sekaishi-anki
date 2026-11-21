import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { isSimilarEvent } from "../../lib/similar";
import { formatYear } from "../../lib/quiz";
import type { Submission } from "../../types/quiz";

/** 提出内容。分類（章・タグ・テーマ）は admin が承認時に付けるので入力しない */
export interface SubmitFormState {
  event: string;
  year: number;
  description: string;
  wikiUrl: string;
}

interface SubmitTabProps {
  /** 成功したら true を返す（true のときだけフォームをリセット） */
  onSubmit: (data: SubmitFormState) => Promise<boolean>;
  pastSubmissions?: Submission[];
  /** 同じ年の公開済み問題を返す（重複警告用） */
  checkSameYear: (year: number) => Promise<{ id: string; event: string }[]>;
}

const MIN_YEAR = -4000;
const MAX_YEAR = 2100;

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition";

function parseYear(text: string): number | null {
  const t = text.trim();
  if (!/^-?\d{1,4}$/.test(t)) return null;
  const n = Number(t);
  return n >= MIN_YEAR && n <= MAX_YEAR ? n : null;
}

const STATUS_STYLE: Record<Submission["status"], { label: string; className: string }> = {
  pending: {
    label: "審査待ち",
    className:
      "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
  },
  approved: {
    label: "公開済み",
    className:
      "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
  },
  rejected: {
    label: "見送り",
    className:
      "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30",
  },
};

export function SubmitTab({
  onSubmit,
  pastSubmissions = [],
  checkSameYear,
}: SubmitTabProps) {
  const [event, setEvent] = useState("");
  const [yearText, setYearText] = useState("");
  const [description, setDescription] = useState("");
  const [wikiUrl, setWikiUrl] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bot 対策（人間には見えない欄）
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [sameYear, setSameYear] = useState<{ id: string; event: string }[]>([]);
  const [wikiResults, setWikiResults] = useState<{ title: string; url: string }[]>([]);
  const [wikiLoading, setWikiLoading] = useState(false);

  const year = parseYear(yearText);

  // 年が入力されたら、同じ年の公開済み問題を調べて重複を警告する
  useEffect(() => {
    if (year === null) {
      setSameYear([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      checkSameYear(year)
        .then((rows) => {
          if (!cancelled) setSameYear(rows);
        })
        .catch(() => {
          if (!cancelled) setSameYear([]);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [year, checkSameYear]);

  const similar = sameYear.filter((row) => isSimilarEvent(row.event, event));

  const searchWikipedia = async () => {
    const q = event.trim();
    if (!q) return;
    setWikiLoading(true);
    setWikiResults([]);
    try {
      const url = `https://ja.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        q,
      )}&limit=5&namespace=0&format=json&origin=*`;
      const res = await fetch(url);
      const json = (await res.json()) as [string, string[], string[], string[]];
      setWikiResults(json[1].map((title, i) => ({ title, url: json[3][i] })));
    } catch {
      setWikiResults([]);
    } finally {
      setWikiLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // honeypot が埋まっていたら bot とみなし、成功したふりをして破棄する
    if (honeypot) {
      resetForm();
      return;
    }

    const trimmed = event.trim();
    if (!trimmed) {
      setError("出来事名を入力してください。");
      return;
    }
    if (trimmed.length > 100) {
      setError("出来事名は100文字以内にしてください。");
      return;
    }
    if (year === null) {
      setError(`年は整数で入力してください（${MIN_YEAR}〜${MAX_YEAR}、紀元前はマイナス）。`);
      return;
    }
    if (description.length > 500) {
      setError("説明は500文字以内にしてください。");
      return;
    }
    const url = wikiUrl.trim();
    if (url && !/^https:\/\/[^\s]+$/.test(url)) {
      setError("Wikipedia URL は https:// から始まる形式で入力してください。");
      return;
    }

    setSubmitting(true);
    const ok = await onSubmit({
      event: trimmed,
      year,
      description: description.trim(),
      wikiUrl: url,
    });
    setSubmitting(false);
    if (ok) resetForm();
  };

  const resetForm = () => {
    setEvent("");
    setYearText("");
    setDescription("");
    setWikiUrl("");
    setHoneypot("");
    setSameYear([]);
    setWikiResults([]);
    setError(null);
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">Contribution</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          問題を提出（管理者の承認後に公開）
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="space-y-4">
          <FormRow label="出来事名" required>
            <input
              type="text"
              value={event}
              maxLength={100}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="例: 唐の成立 / ローマ帝国の東西分裂"
              className={inputClass}
            />
          </FormRow>

          <FormRow label="年（西暦）" required>
            <input
              type="text"
              inputMode="numeric"
              value={yearText}
              onChange={(e) => setYearText(e.target.value)}
              placeholder="例: 618 / -221"
              className={inputClass}
            />
            <p className="text-[9px] text-slate-400 font-bold uppercase pl-1">
              紀元前はマイナス（例: -221）
            </p>
          </FormRow>

          {sameYear.length > 0 && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                similar.length > 0
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                  : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-300"
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                {similar.length > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                {year !== null ? formatYear(year) : ""}には登録済みの問題があります
                {similar.length > 0 && "（似た名称あり）"}
              </p>
              <ul className="space-y-1">
                {sameYear.map((row) => (
                  <li
                    key={row.id}
                    className={
                      isSimilarEvent(row.event, event) ? "font-black" : "opacity-80"
                    }
                  >
                    ・{row.event}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] opacity-70">
                同じ年でも別の出来事なら提出できます。すでにある問題と同じ内容でないか確認してください。
              </p>
            </div>
          )}

          <FormRow label="Wikipedia URL（任意）">
            <div className="flex gap-2">
              <input
                type="text"
                value={wikiUrl}
                onChange={(e) => setWikiUrl(e.target.value)}
                placeholder="https://ja.wikipedia.org/wiki/..."
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={searchWikipedia}
                disabled={wikiLoading || !event.trim()}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition disabled:opacity-50"
              >
                {wikiLoading ? "..." : "Search"}
              </button>
            </div>
            {wikiResults.length > 0 && (
              <div className="flex flex-col gap-1 pt-1">
                {wikiResults.map((r) => (
                  <button
                    key={r.url}
                    type="button"
                    onClick={() => {
                      setWikiUrl(r.url);
                      setWikiResults([]);
                    }}
                    className="text-left text-[11px] font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-brand-blue hover:text-brand-blue transition"
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            )}
          </FormRow>

          <FormRow label="説明（任意）">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="年の根拠や補足など（例: 西ローマ帝国の滅亡は476年とする）"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none resize-none transition"
            />
          </FormRow>

          {/* honeypot: 人間には見えない・タブ移動もされない */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold text-center">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-brand-blue hover:bg-brand-sky text-white font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition disabled:opacity-50"
        >
          {submitting ? "送信中..." : "Submit"}
        </button>
        <p className="text-[10px] text-slate-400 text-center font-semibold">
          章・テーマ・タグなどの分類は、管理者が承認時に付けます。
        </p>
      </div>

      {pastSubmissions.length > 0 && (
        <div className="bg-white dark:bg-brand-navy-light p-6 rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest">
            提出履歴 ({pastSubmissions.length})
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {pastSubmissions.map((sub) => {
              const style = STATUS_STYLE[sub.status];
              return (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-brand-navy border border-slate-100 dark:border-brand-slate/20 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {sub.event}
                      </span>
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-brand-blue/15 text-brand-blue border border-brand-blue/20 text-[8px] font-bold">
                        {formatYear(sub.year)}
                      </span>
                    </div>
                    {sub.status === "rejected" && sub.reviewer_note && (
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        {sub.reviewer_note}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
