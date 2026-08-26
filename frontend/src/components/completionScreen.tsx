import { CheckCircle2, ListChecks, SkipForward } from "lucide-react";
import type { SummaryResponse } from "../types/assessment";

interface CompletionScreenProps {
  summary: SummaryResponse | null;
  onClose: () => void;
}

export default function CompletionScreen({ summary, onClose }: CompletionScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl2 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <CheckCircle2 size={28} />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-ink">Assessment Complete</h2>
        <p className="mb-6 text-sm text-ink/55">
          Your responses have been recorded successfully. Thank you for your time and effort.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl2 bg-surface p-4">
            <ListChecks size={16} className="mx-auto mb-1.5 text-ink/40" />
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-ink/40">
              QUESTIONS ANSWERED
            </p>
            <p className="text-2xl font-bold text-ink">{summary?.correct ?? "—"}</p>
          </div>
          <div className="rounded-xl2 bg-surface p-4">
            <SkipForward size={16} className="mx-auto mb-1.5 text-ink/40" />
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-ink/40">
              QUESTIONS SKIPPED
            </p>
            <p className="text-2xl font-bold text-ink">{summary?.skipped ?? "—"}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Close Assessment ↗
        </button>
      </div>
    </div>
  );
}