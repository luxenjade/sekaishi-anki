import {
  AtSign,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Info,
  KeyRound,
  Layout,
  Link as LinkIcon,
  LogOut,
  Mail,
  Moon,
  Palette,
  Shield,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

interface SettingsTabProps {
  /** 将来的にSupabaseから取得した値を表示するためのフック */
  account?: {
    username: string;
    email: string;
  };
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
  onClearData?: () => void;
}

export function SettingsTab({
  account = { username: "J. Student", email: "student@example.com" },
  onSignOut,
  onDeleteAccount,
  onClearData,
}: SettingsTabProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">Settings</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Account, Theme, Privacy
        </p>
      </div>

      <div className="space-y-6">
        <AccountSection
          username={account.username}
          email={account.email}
          onSignOut={onSignOut}
          onDeleteAccount={onDeleteAccount}
        />

        <AppearanceSection theme={theme} onChangeTheme={setTheme} />

        <DataSection onClear={onClearData} />

        <DocumentsSection />

        <DeveloperSection />

        <p className="text-center text-[10px] font-black text-slate-300 dark:text-zinc-700 uppercase tracking-[0.2em] pt-4">
          Version 0.2.1-Alpha
        </p>
      </div>
    </div>
  );
}

function AccountSection({
  username,
  email,
  onSignOut,
  onDeleteAccount,
}: {
  username: string;
  email: string;
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        Account
      </h3>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-black">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black">{username}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase truncate">
              {email}
            </p>
          </div>
          <span className="ml-auto px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-black uppercase">
            Synced
          </span>
        </div>

        <div className="p-5 space-y-5">
          <Field icon={<User className="w-3 h-3" />} label="Display Name">
            <input
              type="text"
              defaultValue={username}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={<Mail className="w-3 h-3" />} label="Email">
              <input
                type="email"
                defaultValue={email}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
              />
            </Field>
            <Field icon={<KeyRound className="w-3 h-3" />} label="Password">
              <input
                type="password"
                placeholder="New password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
              />
            </Field>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-xs uppercase tracking-widest shadow-md active:scale-[0.98] transition"
            >
              Save Account
            </button>
            <button
              type="button"
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-300 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
            >
              Send Reset Link
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800">
          <SettingsRow
            icon={<LogOut className="w-4 h-4" />}
            label="Sign Out"
            description="End current session"
            onClick={onSignOut}
          />
          <SettingsRow
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete Account"
            description="Remove profile and saved progress"
            danger
            onClick={onDeleteAccount}
          />
        </div>
      </div>
    </section>
  );
}

function AppearanceSection({
  theme,
  onChangeTheme,
}: {
  theme: "light" | "dark";
  onChangeTheme: (t: "light" | "dark") => void;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        Appearance
      </h3>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
              <Palette className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">Theme</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                Switch the app appearance
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => onChangeTheme(theme === "dark" ? "light" : "dark")}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              theme === "dark"
                ? "bg-amber-500"
                : "bg-slate-200 dark:bg-zinc-800"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                theme === "dark" ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-zinc-950 p-1 border border-slate-200 dark:border-zinc-800">
          <ThemeButton
            active={theme === "light"}
            onClick={() => onChangeTheme("light")}
            icon={<Sun className="w-4 h-4" />}
            label="Light"
          />
          <ThemeButton
            active={theme === "dark"}
            onClick={() => onChangeTheme("dark")}
            icon={<Moon className="w-4 h-4" />}
            label="Dark"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoTile
            icon={<Layout className="w-4 h-4" />}
            accent="amber"
            label="Layout"
            value="Compact"
          />
          <InfoTile
            icon={<Shield className="w-4 h-4" />}
            accent="emerald"
            label="Privacy"
            value="Local First"
          />
        </div>
      </div>
    </section>
  );
}

function DataSection({ onClear }: { onClear?: () => void }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        Data Management
      </h3>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <SettingsRow
          icon={<Database className="w-4 h-4" />}
          label="Clear Learning Data"
          description="Reset stats and review queue"
          trailing={
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
              Reset
            </span>
          }
          onClick={onClear}
        />
        <SettingsRow
          icon={<Trash2 className="w-4 h-4" />}
          label="Delete All Data"
          description="Keep account, remove learning records"
          danger
          trailing={
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Permanent
            </span>
          }
        />
      </div>
    </section>
  );
}

function DocumentsSection() {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        Documents
      </h3>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <SettingsRow
          icon={<FileText className="w-4 h-4" />}
          label="Privacy Policy"
          description="Data handling and deletion policy"
          trailing={<ExternalLink className="w-3.5 h-3.5 text-slate-300" />}
        />
        <SettingsRow
          icon={<Info className="w-4 h-4" />}
          label="About Sekaishi-Anki"
          description="Version, roadmap, credits"
          trailing={<ChevronRight className="w-4 h-4 text-slate-300" />}
        />
        <SettingsRow
          icon={<HelpCircle className="w-4 h-4" />}
          label="Help Center"
          description="FAQ and support contact"
          trailing={<ChevronRight className="w-4 h-4 text-slate-300" />}
        />
      </div>
    </section>
  );
}

function DeveloperSection() {
  const links = [
    {
      href: "https://x.com/",
      label: "Twitter",
      icon: AtSign,
      hover: "hover:text-sky-500 hover:border-sky-500/30",
    },
    {
      href: "https://github.com/",
      label: "GitHub",
      icon: LinkIcon,
      hover:
        "hover:text-slate-900 dark:hover:text-white hover:border-slate-900/30 dark:hover:border-white/30",
    },
    {
      href: "https://sekaishi-anki.example.com",
      label: "Website",
      icon: Globe,
      hover: "hover:text-amber-500 hover:border-amber-500/30",
    },
  ];
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        Developer
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-300 transition-all shadow-sm flex items-center gap-3 ${link.hover}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">
                {link.label}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ===== 共通 UI =====

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  danger?: boolean;
  trailing?: React.ReactNode;
  onClick?: () => void;
}

function SettingsRow({
  icon,
  label,
  description,
  danger,
  trailing,
  onClick,
}: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-5 py-4 flex items-center justify-between transition ${
        danger
          ? "hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400"
          : "hover:bg-slate-50 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            danger
              ? "bg-rose-100 dark:bg-rose-950/30"
              : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
          }`}
        >
          {icon}
        </div>
        <div className="text-left">
          <p className="text-sm font-bold">{label}</p>
          <p
            className={`text-[10px] font-bold uppercase ${danger ? "opacity-60" : "text-slate-400"}`}
          >
            {description}
          </p>
        </div>
      </div>
      {trailing ?? <ChevronRight className="w-4 h-4 text-slate-300" />}
    </button>
  );
}

function ThemeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition ${
        active
          ? "bg-white dark:bg-zinc-900 text-amber-500 shadow-sm"
          : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InfoTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "amber" | "emerald";
}) {
  const accentClass =
    accent === "amber" ? "text-amber-500" : "text-emerald-500";
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
      <div className={`flex items-center gap-2 mb-2 ${accentClass}`}>
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}
