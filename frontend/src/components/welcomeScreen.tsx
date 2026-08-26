import { Bot, FileEdit, SkipForward, MonitorCheck, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
  starting: boolean;
}

const FEATURES = [
  {
    icon: FileEdit,
    title: "Free-Text Format",
    description:
      "You will be presented with a series of technical questions. Provide free-text answers. Detail your thought process clearly.",
  },
  {
    icon: SkipForward,
    title: "Strategic Skipping",
    description:
      "You can skip any question if you are unsure. It is often better to skip than to provide an entirely guessed answer.",
  },
  {
    icon: MonitorCheck,
    title: "Focused Environment",
    description:
      "Ensure you have a stable connection. Once you begin, a timer will start for the entire assessment module.",
  },
];

export default function WelcomeScreen({ onStart, starting }: WelcomeScreenProps) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
        <Sparkles size={12} />
        Preparation Phase
      </span>

      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-ink">
        Technical Concept Assessment
      </h1>
      <p className="mb-8 max-w-xl text-ink/60">
        Welcome. This module is designed to evaluate your fundamental understanding of core
        engineering principles through a specialized interface.
      </p>

      <div className="mb-8 flex items-start gap-4 rounded-xl2 bg-white p-6 shadow-card">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Bot size={20} />
        </div>
        <div>
          <p className="mb-1 font-semibold text-ink">Evaluated by Qualify AI</p>
          <p className="text-sm text-ink/60">
            Our AI evaluator will dynamically analyze your responses. It looks beyond simple
            keywords to assess your genuine conceptual understanding, problem-solving approach,
            and technical communication clarity.
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl2 bg-white p-5 shadow-card">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink/70">
              <Icon size={16} />
            </div>
            <p className="mb-1.5 font-semibold text-ink">{title}</p>
            <p className="text-sm leading-relaxed text-ink/55">{description}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-ink/5 pt-6">
        <p className="text-sm text-ink/50">
          By starting, you agree to the assessment{" "}
          <a href="#" className="font-medium text-brand-600 underline underline-offset-2">
            honor code
          </a>
          .
        </p>
        <button
          onClick={onStart}
          disabled={starting}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {starting ? "Starting…" : "Start Assessment"}
          {!starting && <span aria-hidden>→</span>}
        </button>
      </div>
    </div>
  );
}