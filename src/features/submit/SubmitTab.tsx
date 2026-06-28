import { useState } from "react";

const FIELDS = [
  "Politics",
  "Economy",
  "Culture/Religion",
  "Social",
  "War/Diplomacy",
  "Science/Technology",
];
const REGIONS = [
  "East Asia",
  "Europe",
  "Middle East",
  "Americas",
  "Africa",
  "South Asia",
];

interface SubmitTabProps {
  onSubmit?: (data: SubmitFormState) => void;
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
  field: "Politics",
  regions: [],
  wikipediaUrl: "",
  description: "",
};

export function SubmitTab({ onSubmit }: SubmitTabProps) {
  const [form, setForm] = useState<SubmitFormState>(INITIAL);

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

  const handleSubmit = () => {
    if (onSubmit) onSubmit(form);
    // 送信後はフォームをリセット
    setForm(INITIAL);
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
          <FormRow label="Event Title" required>
            <input
              type="text"
              value={form.event}
              onChange={(e) => update("event", e.target.value)}
              placeholder="例: ローマ帝国の分裂"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
            />
          </FormRow>

          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Start Year" required>
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
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
            <FormRow label="Field Category">
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

          <FormRow label="Regions (Multiple)">
            <div className="flex flex-wrap gap-2 p-1">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition ${
                    form.regions.includes(region)
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                      : "border-slate-200 dark:border-zinc-800 hover:border-amber-400 hover:text-amber-500"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </FormRow>

          <FormRow label="Wikipedia URL">
            <div className="flex gap-2">
              <input
                type="text"
                value={form.wikipediaUrl}
                onChange={(e) => update("wikipediaUrl", e.target.value)}
                placeholder="https://ja.wikipedia.org/wiki/..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
              />
              <button
                type="button"
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition"
              >
                Search
              </button>
            </div>
          </FormRow>

          <FormRow label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              placeholder="Short summary for the quiz card..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none resize-none transition"
            />
          </FormRow>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition"
        >
          Submit to Database
        </button>
      </div>
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
