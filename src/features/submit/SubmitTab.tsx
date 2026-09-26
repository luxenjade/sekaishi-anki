import { useState } from "react";
import { Loader2, Search as SearchIcon, X } from "lucide-react";
import { CHAPTERS } from "../../lib/chapters";
import { THEMES } from "../../lib/themes";
import { CORE_TAGS, normalizeTagInput, tagLabel } from "../../data/tags";

interface SubmitTabProps {
  onSubmit?: (data: SubmitFormState) => void;
  pastSubmissions?: SubmitFormState[];
}

export interface SubmitFormState {
  event: string;
  year: number | null;
  yearEnd: number | null;
  recordType: string;
  chapter: string;
  field: string;
  tags: string[];
  wikipediaUrl: string;
  description: string;
  /**
   * 審査ステータス。フォーム入力時には存在せず、Supabaseから取得した
   * 投稿履歴を表示する際にだけ埋まる（App.tsx の submissions state 経由）。
   */
  status?: "pending" | "approved" | "rejected";
}

const INITIAL: SubmitFormState = {
  event: "",
  year: null,
  yearEnd: null,
  recordType: "event",
  chapter: CHAPTERS[0],
  field: THEMES[0].key,
  tags: [],
  wikipediaUrl: "",
  description: "",
};

interface FormErrors {
  event?: string;
  year?: string;
}

interface WikiResult {
  title: string;
  url: string;
}

/**
 * ja.wikipedia.org の opensearch API をブラウザから直接呼び出す。
 * origin=* を付けるとCORSが許可されるため、バックエンドのプロキシは不要。
 * 参考: https://www.mediawiki.org/wiki/API:Opensearch
 */
async function searchWikipedia(query: string): Promise<WikiResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    action: "opensearch",
    search: trimmed,
    limit: "5",
    namespace: "0",
    format: "json",
    origin: "*",
  });

  const res = await fetch(
    `https://ja.wikipedia.org/w/api.php?${params.toString()}`,
  );
  if (!res.ok) {
    throw new Error(`Wikipedia検索に失敗しました (HTTP ${res.status})`);
  }
  const data = (await res.json()) as [string, string[], string[], string[]];
  const titles = data[1] ?? [];
  const urls = data[3] ?? [];
  return titles
    .map((title, i) => ({ title, url: urls[i] ?? "" }))
    .filter((r) => r.url);
}

export function SubmitTab({ onSubmit, pastSubmissions = [] }: SubmitTabProps) {
  const [form, setForm] = useState<SubmitFormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [customTagInput, setCustomTagInput] = useState("");

  // スパム対策: 画面上には表示しないハニーポット欄。
  // ボットは自動的にフォーム内の入力欄を全て埋めがちなので、
  // 「人間には見えないが存在はする」フィールドが埋まっていたら
  // 静かに送信を破棄する（エラーは出さず、ボット側に気づかせない）。
  const [honeypot, setHoneypot] = useState("");

  // Wikipedia検索の状態
  const [wikiQuery, setWikiQuery] = useState("");
  const [wikiResults, setWikiResults] = useState<WikiResult[]>([]);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState<string | null>(null);
  const [wikiSearched, setWikiSearched] = useState(false);

  const update = <K extends keyof SubmitFormState>(
    key: K,
    value: SubmitFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tagKey: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagKey)
        ? prev.tags.filter((t) => t !== tagKey)
        : [...prev.tags, tagKey],
    }));
  };

  const addCustomTag = () => {
    const normalized = normalizeTagInput(customTagInput);
    setCustomTagInput("");
    if (!normalized) return;
    if (form.tags.includes(normalized)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, normalized] }));
  };

  const removeTag = (tagKey: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagKey),
    }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.event.trim()) {
      next.event = "出来事名を入力してください。";
    } else if (form.event.trim().length > 300) {
      next.event = "出来事名が長すぎます（300文字以内）。";
    }
    if (form.year === null || Number.isNaN(form.year)) {
      next.year = "年号を入力してください。";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    // ハニーポットが埋まっている = ボットの可能性が高いので静かに破棄。
    // 人間の利用者にはこのフィールド自体が見えていないため、
    // エラーを出さずに（あたかも成功したかのように振る舞い）終える。
    if (honeypot.trim() !== "") {
      setForm(INITIAL);
      setErrors({});
      return;
    }

    if (!validate()) return;

    if (onSubmit) onSubmit(form);
    // 送信後はフォームをリセット
    setForm(INITIAL);
    setErrors({});
    setCustomTagInput("");
    setWikiQuery("");
    setWikiResults([]);
    setWikiSearched(false);
  };

  const handleWikipediaSearch = async () => {
    const query = wikiQuery.trim() || form.event.trim();
    if (!query) {
      setWikiError("検索語（または出来事名）を入力してください。");
      return;
    }
    setWikiLoading(true);
    setWikiError(null);
    setWikiSearched(true);
    try {
      const results = await searchWikipedia(query);
      setWikiResults(results);
      if (results.length === 0) {
        setWikiError("該当する記事が見つかりませんでした。");
      }
    } catch (e) {
      setWikiError(
        e instanceof Error
          ? e.message
          : "Wikipedia検索中にエラーが発生しました。",
      );
      setWikiResults([]);
    } finally {
      setWikiLoading(false);
    }
  };

  const pickWikiResult = (result: WikiResult) => {
    update("wikipediaUrl", result.url);
    setWikiResults([]);
    setWikiSearched(false);
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Contribution</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Global Database Submission
          </p>
        </div>
        <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[8px] font-black uppercase tracking-tighter">
          Verified Creator
        </span>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="space-y-4">
          {/* ハニーポット: 通常のユーザーには見えない。CSSで隠し、
              tabIndex/autoComplete も外してスクリーンリーダー・キーボード操作の
              邪魔にならないようにする。name はボットが好んで狙う典型的な語にする。 */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <FormRow label="Event Title" required error={errors.event}>
            <input
              type="text"
              value={form.event}
              onChange={(e) => update("event", e.target.value)}
              placeholder="例: ローマ帝国の分裂"
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition ${
                errors.event
                  ? "border-rose-400 dark:border-rose-600"
                  : "border-slate-200 dark:border-zinc-800"
              }`}
            />
          </FormRow>

          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Start Year" required error={errors.year}>
              <input
                type="number"
                value={form.year ?? ""}
                onChange={(e) =>
                  update(
                    "year",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                placeholder="-221"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition ${
                  errors.year
                    ? "border-rose-400 dark:border-rose-600"
                    : "border-slate-200 dark:border-zinc-800"
                }`}
              />
              <p className="text-[8px] text-slate-400 font-bold uppercase pl-1">
                Negative = BC
              </p>
            </FormRow>
            <FormRow label="End Year (Optional)">
              <input
                type="number"
                value={form.yearEnd ?? ""}
                onChange={(e) =>
                  update(
                    "yearEnd",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                placeholder="395"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition"
              />
            </FormRow>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Record Type" required>
              <select
                value={form.recordType}
                onChange={(e) => update("recordType", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold outline-none cursor-pointer"
              >
                <option value="event">Event</option>
                <option value="period">Period</option>
                <option value="person">Person</option>
              </select>
            </FormRow>
            <FormRow label="Theme (テーマ)">
              <select
                value={form.field}
                onChange={(e) => update("field", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold outline-none cursor-pointer"
              >
                {THEMES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </FormRow>
          </div>

          <FormRow label="Chapter (出題章)" required>
            <select
              value={form.chapter}
              onChange={(e) => update("chapter", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold outline-none cursor-pointer"
            >
              {CHAPTERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="Tags (国・主体, 複数選択可)">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 p-1">
                {CORE_TAGS.map((tag) => (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => toggleTag(tag.key)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition ${
                      form.tags.includes(tag.key)
                        ? "border-brand-blue/40 bg-brand-blue/10 text-brand-blue"
                        : "border-slate-200 dark:border-zinc-800 hover:border-brand-blue hover:text-brand-blue"
                    }`}
                  >
                    #{tag.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="上に無いタグを追加 (例: poland)"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-medium focus:ring-2 focus:ring-brand-blue outline-none transition"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                >
                  追加
                </button>
              </div>

              {form.tags.filter((t) => !CORE_TAGS.some((c) => c.key === t))
                .length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.tags
                    .filter((t) => !CORE_TAGS.some((c) => c.key === t))
                    .map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand-blue/10 text-brand-blue text-[10px] font-bold"
                      >
                        #{tagLabel(t)}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          aria-label={`${t}タグを削除`}
                          className="hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </FormRow>

          <FormRow label="Wikipedia URL">
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.wikipediaUrl}
                  onChange={(e) => update("wikipediaUrl", e.target.value)}
                  placeholder="https://ja.wikipedia.org/wiki/..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleWikipediaSearch}
                  disabled={wikiLoading}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-700 transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {wikiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <SearchIcon className="w-3.5 h-3.5" />
                  )}
                  Search
                </button>
              </div>
              <input
                type="text"
                value={wikiQuery}
                onChange={(e) => setWikiQuery(e.target.value)}
                placeholder={`検索語を入力（空欄なら「${form.event || "Event Title"}」で検索）`}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-medium focus:ring-2 focus:ring-brand-blue outline-none transition"
              />

              {wikiError && (
                <p className="text-[10px] font-semibold text-rose-500 px-1">
                  {wikiError}
                </p>
              )}

              {wikiSearched && wikiResults.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
                  {wikiResults.map((result) => (
                    <button
                      key={result.url}
                      type="button"
                      onClick={() => pickWikiResult(result)}
                      className="w-full text-left px-3 py-2 text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{result.title}</span>
                      <span className="text-brand-blue text-[9px] font-black uppercase shrink-0">
                        選択
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FormRow>

          <FormRow label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              placeholder="Short summary for the quiz card..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none resize-none transition"
            />
          </FormRow>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl bg-brand-blue hover:bg-brand-sky text-white font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition"
        >
          Submit to Database
        </button>
      </div>

      {pastSubmissions.length > 0 && (
        <div className="bg-white dark:bg-brand-navy-light p-6 rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            投稿履歴 ({pastSubmissions.length})
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {pastSubmissions.map((sub, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-brand-navy border border-slate-100 dark:border-brand-slate/20 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {sub.event}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-brand-blue/15 text-brand-blue border border-brand-blue/20 text-[8px] font-bold">
                      {sub.year !== null
                        ? sub.year < 0
                          ? `前${Math.abs(sub.year)}年`
                          : `${sub.year}年`
                        : "不明"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    {sub.description || "説明なし"}
                  </p>
                </div>
                {/*
                  NOTE: 常に「Approved」固定表示だったのを、実際の status
                  （デフォルトは pending）に合わせて表示するよう修正。
                  wh_submissions.status を審査結果としてそのまま見せる。
                */}
                <StatusBadge status={sub.status ?? "pending"} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type SubStatus = "pending" | "approved" | "rejected";

function StatusBadge({ status }: { status: SubStatus }) {
  const styles: Record<SubStatus, string> = {
    pending:
      "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
    approved:
      "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
    rejected:
      "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30",
  };
  const text: Record<SubStatus, string> = {
    pending: "審査中",
    approved: "承認済み",
    rejected: "非承認",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${styles[status]}`}
    >
      {text[status]}
    </span>
  );
}

function FormRow({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-[10px] font-semibold text-rose-500 px-1">{error}</p>
      )}
    </div>
  );
}
