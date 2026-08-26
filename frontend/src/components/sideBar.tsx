import { ClipboardList, Info, BookOpen, FileEdit, Settings, GraduationCap, ShieldCheck } from "lucide-react";

interface SidebarProps {
  activeItem: "assessment" | "instructions" | "resources" | "notes" | "admin";
  onNavigate: (item: "assessment" | "instructions" | "resources" | "notes" | "admin") => void;
  canSubmitFinal: boolean;
  onSubmitFinal: () => void;
}

const NAV_ITEMS = [
  { key: "assessment" as const, label: "Assessment", icon: ClipboardList },
  { key: "instructions" as const, label: "Instructions", icon: Info },
  { key: "resources" as const, label: "Resources", icon: BookOpen },
  { key: "notes" as const, label: "Notes", icon: FileEdit },
  { key: "admin" as const, label: "Admin", icon: ShieldCheck },
];

export default function Sidebar({
  activeItem,
  onNavigate,
  canSubmitFinal,
  onSubmitFinal,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-ink/5 bg-white px-4 py-6">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white">
          <GraduationCap size={18} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-ink">Technical Interview</p>
          <p className="text-xs text-ink/50">Module 1: Logic</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = activeItem === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-600"
                  : "text-ink/60 hover:bg-surface hover:text-ink"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-ink/5 pt-4">
        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/60 hover:bg-surface hover:text-ink">
          <Settings size={17} />
          Settings
        </button>
        <button
          onClick={onSubmitFinal}
          disabled={!canSubmitFinal}
          className="rounded-lg bg-surface px-3 py-2.5 text-sm font-semibold text-ink/40 transition-colors enabled:bg-ink enabled:text-white enabled:hover:bg-ink/90 disabled:cursor-not-allowed"
        >
          Submit Final
        </button>
      </div>
    </aside>
  );
}