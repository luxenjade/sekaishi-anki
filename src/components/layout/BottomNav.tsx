import {
  BarChart3,
  PlusSquare,
  PlayCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import type { AppTab } from "../../types/quiz";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const NAV_ITEMS: {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "quiz", label: "Learn", icon: PlayCircle },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "submit", label: "Post", icon: PlusSquare },
  { id: "settings", label: "Config", icon: SettingsIcon },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 z-50">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-all ${
                isActive
                  ? "text-brand-blue"
                  : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-200"
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${isActive ? "scale-110" : ""}`}
              />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
