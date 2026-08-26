import { useState } from "react";
import { KeyRound } from "lucide-react";

const STORAGE_KEY = "qualify_ai_admin_key";

interface AdminKeyGateProps {
  onUnlock: (key: string) => void;
}

export default function AdminKeyGate({ onUnlock }: AdminKeyGateProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    localStorage.setItem(STORAGE_KEY, value.trim());
    onUnlock(value.trim());
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-20 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-white">
        <KeyRound size={20} />
      </div>
      <h2 className="mb-2 text-xl font-bold text-ink">Admin access</h2>
      <p className="mb-6 text-sm text-ink/55">
        Enter the admin key to manage the question set. This matches the
        <code className="mx-1 rounded bg-surface px-1.5 py-0.5 text-xs">ADMIN_API_KEY</code>
        configured on the backend.
      </p>
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Admin key"
          className="mb-3 w-full rounded-lg border border-ink/10 bg-white px-4 py-2.5 text-sm shadow-card placeholder:text-ink/30"
          autoFocus
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}

export function getStoredAdminKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearStoredAdminKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}