import {
  BarChart3,
  PlusSquare,
  PlayCircle,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";
import type { AppTab } from "../../types/quiz";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  /** admin のときだけ管理タブを表示 */
  showAdmin?: boolean;
}

const NAV_ITEMS: {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}[] = [
  { id: "quiz", label: "Learn", icon: PlayCircle },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "submit", label: "Post", icon: PlusSquare },
  { id: "admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
  { id: "settings", label: "Config", icon: SettingsIcon },
];

export function BottomNav({
  active,
  onChange,
  showAdmin = false,
}: BottomNavProps) {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || showAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-qz-surface border-t border-qz-border shadow-qz-sm pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-[860px] mx-auto flex items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex-1 flex flex-col items-center gap-1 pt-2.5 pb-2 transition-colors ${
                isActive
                  ? "text-qz-accent-text"
                  : "text-qz-sub hover:text-qz-text"
              }`}
            >
              {/* 現在地を示す金色のバー */}
              <span
                aria-hidden
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full bg-qz-accent transition-all ${
                  isActive ? "w-10" : "w-0"
                }`}
              />
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
