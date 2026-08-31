import { CheckCircle2 } from "lucide-react";

interface EvaluationPanelProps {
  message: string;
  onNext: () => void;
}

export default function EvaluationPanel({ message, onNext }: EvaluationPanelProps) {
  return (
    <div className="flex w-full flex-col gap-4 md:w-72 md:shrink-0">
      <div className="rounded-xl2 border border-emerald-200 bg-emerald-50/40 p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 size={14} />
          </div>
          <p className="text-sm font-semibold text-emerald-700">AI Evaluation: Correct</p>
        </div>
        <p className="text-sm leading-relaxed text-ink/70">{message}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
      >
        Next Question →
      </button>
    </div>
  );
}