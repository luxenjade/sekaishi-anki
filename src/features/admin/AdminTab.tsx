import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Eye, EyeOff, RefreshCw, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { DB_WH_DATE_COLUMNS, type DbWhDate } from "../../lib/database";
import {
  CHAPTERS,
  CHAPTER_LABEL,
  THEMES,
  THEME_LABEL,
} from "../../lib/taxonomy";
import { formatYear } from "../../lib/quiz";
import { isSimilarEvent } from "../../lib/similar";
import type { QuestionTheme, Submission } from "../../types/quiz";

interface TagRow {
  key: string;
  label: string;
}

type View = "pending" | "published";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition";

/**
 * 管理ページ。表示の出し分けは App 側（isAdmin）で行うが、
 * 実際の権限は DB の RLS / RPC（is_admin()）が守る。
 */
export function AdminTab() {
  const [view, setView] = useState<View>("pending");
  const [tags, setTags] = useState<TagRow[]>([]);

  useEffect(() => {
    supabase
      .from("wh_tags")
      .select("key, label")
      .order("sort")
      .then(({ data }) => setTags((data ?? []) as TagRow[]));
  }, []);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">Admin</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          提出の承認・問題の管理
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-brand-navy p-1 border border-slate-200 dark:border-brand-slate/30">
        {(
          [
            ["pending", "提出待ち"],
            ["published", "問題一覧"],
          ] as [View, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition ${
              view === id
                ? "bg-white dark:bg-brand-navy-light text-brand-blue shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "pending" ? <PendingList tags={tags} /> : <QuestionList />}
    </div>
  );
}

// ======================================================================
// 提出待ち
// ======================================================================

function PendingList({ tags }: { tags: TagRow[] }) {
  const [items, setItems] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("wh_submissions")
      .select("id, year, event, description, wiki_url, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (err) {
      setError(err.message);
      setItems([]);
      return;
    }
    setError(null);
    setItems((data ?? []) as Submission[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (items === null) {
    return <p className="text-xs text-slate-400 text-center py-8">読み込み中...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          審査待ち {items.length} 件
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="p-2 rounded-lg border border-slate-200 dark:border-brand-slate/30 text-slate-500 hover:text-brand-blue transition"
          aria-label="再読み込み"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-semibold">{error}</p>
      )}

      {items.length === 0 && !error && (
        <p className="text-xs text-slate-400 font-medium text-center py-8">
          審査待ちの提出はありません。
        </p>
      )}

      {items.map((s) => (
        <PendingCard key={s.id} submission={s} tags={tags} onDone={load} />
      ))}
    </div>
  );
}

function PendingCard({
  submission,
  tags,
  onDone,
}: {
  submission: Submission;
  tags: TagRow[];
  onDone: () => Promise<void>;
}) {
  const [year, setYear] = useState(String(submission.year));
  const [event, setEvent] = useState(submission.event);
  const [description, setDescription] = useState(submission.description ?? "");
  const [chapter, setChapter] = useState("");
  const [theme, setTheme] = useState<QuestionTheme | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sameYear, setSameYear] = useState<DbWhDate[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const yearNum = Number(year);
  const yearValid = year.trim() !== "" && Number.isInteger(yearNum);

  // 同じ年の既存問題（非公開も含む。admin は全件読める）
  useEffect(() => {
    if (!yearValid) {
      setSameYear([]);
      return;
    }
    let cancelled = false;
    supabase
      .from("wh_dates")
      .select(DB_WH_DATE_COLUMNS)
      .eq("year", yearNum)
      .order("id")
      .then(({ data }) => {
        if (!cancelled) setSameYear((data ?? []) as unknown as DbWhDate[]);
      });
    return () => {
      cancelled = true;
    };
  }, [yearValid, yearNum]);

  const hasSimilar = useMemo(
    () => sameYear.some((row) => isSimilarEvent(row.event, event)),
    [sameYear, event],
  );

  /** 同年の既存問題の分類を初期値として借りる */
  const applySuggestion = () => {
    const base = sameYear[0];
    if (!base) return;
    setChapter(base.chapter);
    if (THEMES.some((t) => t.key === base.theme)) {
      setTheme(base.theme as QuestionTheme);
    }
    setSelectedTags(base.tags ?? []);
  };

  const toggleTag = (key: string) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const approve = async () => {
    if (!yearValid || !event.trim()) {
      setMsg("年と出来事名を確認してください。");
      return;
    }
    if (!chapter || !theme) {
      setMsg("章とテーマを選択してください。");
      return;
    }

    setBusy(true);
    setMsg(null);
    const { error } = await supabase.rpc("approve_submission", {
      p_submission_id: Number(submission.id),
      p_chapter: chapter,
      p_theme: theme,
      p_tags: selectedTags,
      p_year: yearNum,
      p_event: event.trim(),
      p_description: description.trim() || null,
    });
    setBusy(false);

    if (error) {
      setMsg(
        error.code === "23505"
          ? "同じ年・同じ名称の問題がすでに登録されています。"
          : `承認に失敗しました: ${error.message}`,
      );
      return;
    }
    await onDone();
  };

  const reject = async () => {
    const note = window.prompt("却下の理由（提出者に表示されます。空でも可）", "");
    if (note === null) return;

    setBusy(true);
    setMsg(null);
    const { error } = await supabase.rpc("reject_submission", {
      p_submission_id: Number(submission.id),
      p_note: note.trim() || null,
    });
    setBusy(false);

    if (error) {
      setMsg(`却下に失敗しました: ${error.message}`);
      return;
    }
    await onDone();
  };

  return (
    <div className="bg-white dark:bg-brand-navy-light p-5 rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>出来事名</Label>
          <input
            type="text"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <Label>年</Label>
          <input
            type="text"
            inputMode="numeric"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>説明</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none font-medium`}
        />
        {submission.wiki_url && (
          <a
            href={submission.wiki_url}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-bold text-brand-blue hover:underline break-all"
          >
            {submission.wiki_url}
          </a>
        )}
      </div>

      {sameYear.length > 0 && (
        <div
          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
            hasSimilar
              ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
              : "border-slate-200 dark:border-brand-slate/30 bg-slate-50 dark:bg-brand-navy text-slate-600 dark:text-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold">
              {formatYear(yearNum)}の既存問題 {sameYear.length} 件
              {hasSimilar && "（似た名称あり）"}
            </p>
            <button
              type="button"
              onClick={applySuggestion}
              className="shrink-0 text-[10px] font-bold text-brand-blue hover:underline"
            >
              先頭の分類を適用
            </button>
          </div>
          <ul className="space-y-0.5">
            {sameYear.map((row) => (
              <li
                key={row.id}
                className={isSimilarEvent(row.event, event) ? "font-black" : ""}
              >
                ・{row.event}
                {!row.is_published && "（非公開）"}
                <span className="opacity-60">
                  {" "}
                  — {CHAPTER_LABEL[row.chapter] ?? row.chapter}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>章（必須）</Label>
          <select
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className={inputClass}
          >
            <option value="">選択してください</option>
            {CHAPTERS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>テーマ（必須）</Label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as QuestionTheme | "")}
            className={inputClass}
          >
            <option value="">選択してください</option>
            {THEMES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>タグ</Label>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => toggleTag(t.key)}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition ${
                selectedTags.includes(t.key)
                  ? "border-brand-blue/40 bg-brand-blue/10 text-brand-blue"
                  : "border-slate-200 dark:border-brand-slate/30 text-slate-500 hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {msg && <p className="text-xs text-rose-500 font-semibold">{msg}</p>}

      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={reject}
          disabled={busy}
          className="py-3 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-950/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          却下
        </button>
        <button
          type="button"
          onClick={approve}
          disabled={busy}
          className="py-3 rounded-xl bg-brand-blue hover:bg-brand-sky text-white font-black text-xs uppercase tracking-widest shadow-md active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          承認して公開
        </button>
      </div>
    </div>
  );
}

// ======================================================================
// 問題一覧（公開 / 非公開の切り替え）
// ======================================================================

function QuestionList() {
  const [rows, setRows] = useState<DbWhDate[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("wh_dates")
      .select(DB_WH_DATE_COLUMNS)
      .order("id", { ascending: false })
      .limit(500);

    if (err) {
      setError(err.message);
      setRows([]);
      return;
    }
    setError(null);
    setRows((data ?? []) as unknown as DbWhDate[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.event.toLowerCase().includes(q) || String(r.year) === q,
    );
  }, [rows, search]);

  const togglePublished = async (row: DbWhDate) => {
    const { error: err } = await supabase
      .from("wh_dates")
      .update({ is_published: !row.is_published })
      .eq("id", row.id);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((prev) =>
      prev
        ? prev.map((r) =>
            r.id === row.id ? { ...r, is_published: !row.is_published } : r,
          )
        : prev,
    );
  };

  if (rows === null) {
    return <p className="text-xs text-slate-400 text-center py-8">読み込み中...</p>;
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="出来事名または年で検索"
        className={inputClass}
      />

      {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}

      {filtered.length === 0 && !error && (
        <p className="text-xs text-slate-400 font-medium text-center py-8">
          該当する問題がありません。
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-brand-navy-light border border-slate-200 dark:border-brand-slate/30"
          >
            <div className="min-w-0 space-y-0.5">
              <p
                className={`text-xs font-bold truncate ${
                  row.is_published ? "" : "opacity-50 line-through"
                }`}
              >
                {row.event}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase truncate">
                {formatYear(row.year)} · {CHAPTER_LABEL[row.chapter] ?? row.chapter} ·{" "}
                {THEME_LABEL[row.theme] ?? row.theme}
                {row.tags?.length ? ` · ${row.tags.join(", ")}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void togglePublished(row)}
              className="shrink-0 p-2 rounded-lg border border-slate-200 dark:border-brand-slate/30 text-slate-500 hover:text-brand-blue transition"
              aria-label={row.is_published ? "非公開にする" : "公開する"}
              title={row.is_published ? "非公開にする" : "公開する"}
            >
              {row.is_published ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {rows.length >= 500 && (
        <p className="text-[10px] text-slate-400 text-center font-semibold">
          新しい500件まで表示しています。検索で絞り込んでください。
        </p>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 block">
      {children}
    </label>
  );
}
