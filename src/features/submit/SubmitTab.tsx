import { useState } from "react";
import { Loader2, Search as SearchIcon } from "lucide-react";

const FIELDS = [
  "政治",
  "経済",
  "文化・宗教",
  "社会",
  "外交・戦争",
  "科学・技術",
];
const REGIONS = [
  "東アジア",
  "ヨーロッパ",
  "中東",
  "アメリカ",
  "アフリカ",
  "南アジア",
];

interface SubmitTabProps {
  onSubmit?: (data: SubmitFormState) => void;
  pastSubmissions?: SubmitFormState[];
}

export interface SubmitFormState {
  event: string;
  year: number | null;
  yearEnd: number | null;
  recordType: string;
  field: string;
  regions: string[];
  wikipediaUrl: string;
  description: string;
}

const INITIAL: SubmitFormState = {
  event: "",
  year: null,
  yearEnd: null,
  recordType: "event",
  field: "政治",
  regions: [],
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

  const toggleRegion = (region: string) => {
    setForm((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
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
      next.year = "年代を入力してください。";
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
    setWikiQuery("");
    setWikiResults([]);
    setWikiSearched(false);
  };

  const handleWikipediaSearch = async () => {
    const query = wikiQuery.trim() || form.event.trim();
    if (!query) {
      setWikiError("キーワード（または出来事名）を入力してください。");
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
          <h2 className="text-2xl font-black tracking-tight">投稿</h2>
          <p className="text-xs font-bold text-slate-400 tracking-wide">
            データベースへの投稿
          </p>
        </div>
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

          <FormRow label="出来事名" required error={errors.event}>
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
            <FormRow label="開始年" required error={errors.year}>
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
              <p className="text-xs text-slate-400 font-bold pl-1">
                負の数 = 紀元前
              </p>
            </FormRow>
            <FormRow label="終了年（任意）">
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
            <FormRow label="記録タイプ" required>
              <select
                value={form.recordType}
                onChange={(e) => update("recordType", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold outline-none cursor-pointer"
              >
                <option value="event">出来事</option>
                <option value="period">期間</option>
                <option value="person">人物</option>
              </select>
            </FormRow>
            <FormRow label="分野">
              <select
                value={form.field}
                onChange={(e) => update("field", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold outline-none cursor-pointer"
              >
                {FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </FormRow>
          </div>

          <FormRow label="地域（複数選択可）">
            <div className="flex flex-wrap gap-2 p-1">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`px-3.5 py-2 rounded-lg border text-sm font-bold transition ${
                    form.regions.includes(region)
                      ? "border-brand-blue/40 bg-brand-blue/10 text-brand-blue"
                      : "border-slate-200 dark:border-zinc-800 hover:border-brand-blue hover:text-brand-blue"
                  }`}
                >
                  {region}
                </button>
              ))}
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
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {wikiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <SearchIcon className="w-3.5 h-3.5" />
                  )}
                  検索
                </button>
              </div>
              <input
                type="text"
                value={wikiQuery}
                onChange={(e) => setWikiQuery(e.target.value)}
                placeholder={`キーワードを入力（空欄なら「${form.event || "出来事名"}」で検索）`}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none transition"
              />

              {wikiError && (
                <p className="text-xs font-semibold text-rose-500 px-1">
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
                      className="w-full text-left px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{result.title}</span>
                      <span className="text-brand-blue text-xs font-bold shrink-0">
                        選択
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FormRow>

          <FormRow label="説明">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              placeholder="クイズカード用の短い説明..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none resize-none transition"
            />
          </FormRow>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl bg-brand-blue hover:bg-brand-sky text-white font-black text-sm shadow-xl active:scale-[0.98] transition"
        >
          データベースに投稿
        </button>
      </div>

      {pastSubmissions.length > 0 && (
        <div className="bg-white dark:bg-brand-navy-light p-6 rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm space-y-4">
          <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
            投稿履歴 ({pastSubmissions.length})
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {pastSubmissions.map((sub, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-brand-navy border border-slate-100 dark:border-brand-slate/20 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {sub.event}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-brand-blue/15 text-brand-blue border border-brand-blue/20 text-xs font-bold">
                      {sub.year !== null
                        ? sub.year < 0
                          ? `前${Math.abs(sub.year)}年`
                          : `${sub.year}年`
                        : "不明"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {sub.description || "説明なし"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/30 shrink-0">
                  承認済み
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
      <label className="text-xs font-bold text-slate-400 tracking-wide px-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs font-semibold text-rose-500 px-1">{error}</p>
      )}
    </div>
  );
}
