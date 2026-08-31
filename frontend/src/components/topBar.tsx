import { Bot } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-ink/5 bg-white px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-white">
          <Bot size={14} />
        </div>
        <span className="text-base font-bold text-ink">Qualify AI</span>
      </div>

      <div className="h-8 w-8 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full w-full bg-gradient-to-br from-brand-400 to-brand-600" />
      </div>
    </header>
  );
}