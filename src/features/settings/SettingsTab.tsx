import { useState, useEffect } from "react";
import {
  AtSign,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Info,
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
  account?: {
    username: string;
    email: string;
  };
  isSynced?: boolean;
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
  onClearData?: () => void;
  onSaveProfile?: (username: string) => void;
  onResetPassword?: (email: string) => Promise<{ error: Error | null }>;
  theme?: "light" | "dark";
  onChangeTheme?: (theme: "light" | "dark") => void;
}

export function SettingsTab({
  account = { username: "デモユーザー", email: "student@example.com" },
  isSynced = false,
  onSignOut,
  onDeleteAccount,
  onClearData,
  onSaveProfile,
  onResetPassword,
  theme: themeProp,
  onChangeTheme,
}: SettingsTabProps) {
  const { theme: localTheme, setTheme } = useTheme();
  const theme = themeProp ?? localTheme;
  const handleThemeChange = onChangeTheme ?? setTheme;

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">設定</h2>
        <p className="text-xs font-bold text-slate-400 tracking-wide">
          アカウント・テーマ・プライバシー
        </p>
      </div>

      <div className="space-y-6">
        <AccountSection
          username={account.username}
          email={account.email}
          isSynced={isSynced}
          onSignOut={onSignOut}
          onDeleteAccount={onDeleteAccount}
          onSaveProfile={onSaveProfile}
          onResetPassword={onResetPassword}
        />

        <AppearanceSection
          theme={theme}
          onChangeTheme={handleThemeChange}
          isSynced={isSynced}
        />

        <DataSection onClear={onClearData} />

        <DocumentsSection />

        <DeveloperSection />

        <p className="text-center text-xs font-bold text-slate-300 dark:text-zinc-700 tracking-wide pt-4">
          バージョン 0.2.1-Alpha
        </p>
      </div>
    </div>
  );
}

function AccountSection({
  username,
  email,
  isSynced,
  onSignOut,
  onDeleteAccount,
  onSaveProfile,
  onResetPassword,
}: {
  username: string;
  email: string;
  isSynced?: boolean;
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
  onSaveProfile?: (username: string) => void;
  onResetPassword?: (email: string) => Promise<{ error: Error | null }>;
}) {
  const [usernameInput, setUsernameInput] = useState(username);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    setUsernameInput(username);
  }, [username]);

  const handleResetPassword = async () => {
    if (!onResetPassword) return;
    setResetMessage(null);
    const res = await onResetPassword(email);
    if (res.error) {
      setResetMessage(res.error.message);
    } else {
      setResetMessage("パスワードリセット用のメールを送信しました。");
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-slate-400 tracking-wide px-1">
        アカウント
      </h3>
      <div className="bg-white dark:bg-brand-navy-light rounded-2xl border border-slate-200 dark:border-brand-slate/30 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-brand-slate/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm font-black">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black">{username}</p>
            <p className="text-xs font-bold text-slate-400 truncate">{email}</p>
          </div>
          <span
            className={`ml-auto px-2.5 py-1 rounded-md text-xs font-bold border shrink-0 ${
              isSynced
                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
            }`}
          >
            {isSynced ? "クラウド同期" : "ローカルデモ"}
          </span>
        </div>

        <div className="p-5 space-y-5">
          <Field icon={<User className="w-3 h-3" />} label="表示名">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-brand-slate/30 bg-slate-50 dark:bg-brand-navy text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition"
            />
          </Field>
          <Field icon={<Mail className="w-3 h-3" />} label="メールアドレス">
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-brand-slate/30 bg-slate-100 dark:bg-brand-navy/60 text-sm font-bold text-slate-500 outline-none"
            />
          </Field>
          {resetMessage && (
            <p className="text-xs font-semibold text-brand-blue px-1">
              {resetMessage}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (onSaveProfile) onSaveProfile(usernameInput);
              }}
              className="flex-1 py-3 rounded-xl bg-brand-blue hover:bg-brand-sky text-white font-bold text-sm shadow-md active:scale-[0.98] transition"
            >
              プロフィールを保存
            </button>
            <button
              type="button"
              onClick={handleResetPassword}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-brand-slate/30 text-slate-500 dark:text-zinc-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-brand-navy transition"
            >
              パスワードをリセット
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-brand-slate/20 divide-y divide-slate-100 dark:divide-brand-slate/20">
          <SettingsRow
            icon={<LogOut className="w-4 h-4" />}
            label="ログアウト"
            description="現在のセッションを終了"
            onClick={onSignOut}
          />
          <SettingsRow
            icon={<Trash2 className="w-4 h-4" />}
            label="アカウント削除"
            description="プロフィールと学習データを削除"
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
  isSynced,
}: {
  theme: "light" | "dark";
  onChangeTheme: (t: "light" | "dark") => void;
  isSynced?: boolean;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-slate-400 tracking-wide px-1">
        外観
      </h3>
      <div className="bg-white dark:bg-brand-navy-light rounded-2xl border border-slate-200 dark:border-brand-slate/30 p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-brand-navy flex items-center justify-center text-slate-500">
              <Palette className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">テーマ</p>
              <p className="text-xs text-slate-400 font-bold">
                アプリの見た目を切り替え
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="ダークモードを切り替え"
            onClick={() => onChangeTheme(theme === "dark" ? "light" : "dark")}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              theme === "dark"
                ? "bg-brand-blue"
                : "bg-slate-200 dark:bg-brand-navy"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                theme === "dark" ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-brand-navy p-1 border border-slate-200 dark:border-brand-slate/30">
          <ThemeButton
            active={theme === "light"}
            onClick={() => onChangeTheme("light")}
            icon={<Sun className="w-4 h-4" />}
            label="ライト"
          />
          <ThemeButton
            active={theme === "dark"}
            onClick={() => onChangeTheme("dark")}
            icon={<Moon className="w-4 h-4" />}
            label="ダーク"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoTile
            icon={<Layout className="w-4 h-4" />}
            accent="blue"
            label="レイアウト"
            value="コンパクト"
          />
          <InfoTile
            icon={<Shield className="w-4 h-4" />}
            accent="emerald"
            label="プライバシー"
            value={isSynced ? "クラウド同期" : "ローカルのみ"}
          />
        </div>
      </div>
    </section>
  );
}

function DataSection({ onClear }: { onClear?: () => void }) {
  // NOTE: 以前ここには機能重複した「Delete All Data」行(TrashDataRow)が
  // 並んでいたが、onClick が未配線で何も起きない死んだUIだった上に
  // 下の「Clear Learning Data」と全く同じ操作を指していたため削除した。
  // データ削除の入口は1つに統一する。
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-slate-400 tracking-wide px-1">
        データ管理
      </h3>
      <div className="bg-white dark:bg-brand-navy-light rounded-2xl border border-slate-200 dark:border-brand-slate/30 overflow-hidden shadow-sm">
        <SettingsRow
          icon={<Database className="w-4 h-4" />}
          label="学習データを消去"
          description="統計・復習リスト・投稿をリセット"
          trailing={
            <span className="text-xs font-bold text-rose-500 tracking-wide">
              リセット
            </span>
          }
          onClick={onClear}
        />
      </div>
    </section>
  );
}

function DocumentsSection() {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-slate-400 tracking-wide px-1">
        ドキュメント
      </h3>
      <div className="bg-white dark:bg-brand-navy-light rounded-2xl border border-slate-200 dark:border-brand-slate/30 overflow-hidden shadow-sm">
        <SettingsRow
          icon={<FileText className="w-4 h-4" />}
          label="プライバシーポリシー"
          description="データの取り扱いと削除について"
          trailing={<ExternalLink className="w-3.5 h-3.5 text-slate-300" />}
        />
        <SettingsRow
          icon={<Info className="w-4 h-4" />}
          label="Sekaishi-Anki について"
          description="バージョン・ロードマップ・クレジット"
          trailing={<ChevronRight className="w-4 h-4 text-slate-300" />}
        />
        <SettingsRow
          icon={<HelpCircle className="w-4 h-4" />}
          label="ヘルプセンター"
          description="よくある質問・サポート連絡先"
          trailing={<ChevronRight className="w-4 h-4 text-slate-300" />}
        />
      </div>
    </section>
  );
}

function DeveloperSection() {
  const links = [
    {
      href: "https://x.com/luxenjade2",
      label: "Twitter",
      icon: AtSign,
      hover: "hover:text-sky-500 hover:border-sky-500/30",
    },
    {
      href: "https://github.com/luxenjade/sekaishi-anki",
      label: "GitHub",
      icon: LinkIcon,
      hover:
        "hover:text-slate-900 dark:hover:text-white hover:border-slate-900/30 dark:hover:border-white/30",
    },
    {
      href: "https://luxenjade.netlify.app/",
      label: "Website",
      icon: Globe,
      hover: "hover:text-brand-blue hover:border-brand-blue/30",
    },
  ];
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-slate-400 tracking-wide px-1">
        開発者
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
              className="p-4 rounded-2xl bg-white dark:bg-brand-navy-light border border-slate-200 dark:border-brand-slate/30 text-slate-500 dark:text-zinc-300 transition-all shadow-sm flex items-center gap-3 hover:text-brand-blue hover:border-brand-blue/30"
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-bold tracking-wide">
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
      <label className="text-xs font-bold text-slate-400 tracking-wide px-1 flex items-center gap-1.5">
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
          : "hover:bg-slate-50 dark:hover:bg-brand-navy/60 dark:hover:text-zinc-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            danger
              ? "bg-rose-100 dark:bg-rose-950/30"
              : "bg-slate-100 dark:bg-brand-navy text-slate-500"
          }`}
        >
          {icon}
        </div>
        <div className="text-left">
          <p className="text-sm font-bold">{label}</p>
          <p
            className={`text-xs font-bold ${danger ? "opacity-60" : "text-slate-400"}`}
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
      className={`py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold tracking-wide transition ${
        active
          ? "bg-white dark:bg-brand-navy-light text-brand-blue shadow-sm"
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
  accent: "blue" | "emerald";
}) {
  const accentClass =
    accent === "blue" ? "text-brand-blue" : "text-emerald-500";
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-navy border border-slate-100 dark:border-brand-slate/20">
      <div className={`flex items-center gap-2 mb-2 ${accentClass}`}>
        {icon}
        <p className="text-xs font-bold tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}
