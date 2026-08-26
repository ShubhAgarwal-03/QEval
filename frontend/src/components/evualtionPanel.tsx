import { Sparkles, CheckCircle2 } from "lucide-react";

interface EvaluationPanelProps {
  message: string;
  onNext: () => void;
}

/**
 * NOTE: the backend intentionally does not expose the evaluator's detailed
 * `reason`/`confidence` fields to the client (see PRD §11/§20) - those stay
 * in backend logs only. This panel therefore shows the single high-level
 * `message` the API returns, rather than fabricating a multi-point
 * breakdown of the model's private reasoning.
 */
export default function EvaluationPanel({ message, onNext }: EvaluationPanelProps) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-4">
      <div className="rounded-xl2 bg-brand-50/60 p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white">
            <Sparkles size={13} />
          </div>
          <p className="text-sm font-semibold text-ink">AI Evaluation</p>
        </div>
        <div className="flex items-start gap-2 text-sm text-ink/70">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
          <span>{message}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl2 bg-white p-5 text-center shadow-card">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 size={20} />
        </div>
        <p className="text-sm font-medium text-ink">Ready to proceed</p>
        <button
          onClick={onNext}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Next Question →
        </button>
      </div>
    </div>
  );
}