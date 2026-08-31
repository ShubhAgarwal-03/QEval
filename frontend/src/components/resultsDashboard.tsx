import { Trophy, CheckCircle2, XCircle, SkipForward, ListChecks, Lightbulb } from "lucide-react";
import type { SummaryResponse } from "../types/assessment";

interface ResultsDashboardProps {
  summary: SummaryResponse;
}

export default function ResultsDashboard({ summary }: ResultsDashboardProps) {
  const { total_questions, correct, incorrect_attempts, skipped, completed, performance_insight } = summary;
  const scorePercent = total_questions > 0 ? Math.round((correct / total_questions) * 100) : 0;
  const circumference = 2 * Math.PI * 42;

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
        <Trophy size={12} />
        {completed ? "Assessment Complete" : "Progress Snapshot"}
      </span>

      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-ink">
        {completed ? "Your Results" : "Your Progress So Far"}
      </h1>
      <p className="mb-8 max-w-xl text-ink/60">
        {completed
          ? "Here's how you did across the assessment. Your responses have been recorded."
          : "A snapshot of your progress so far."}
      </p>

      <div className="mb-8 flex items-center gap-6 rounded-xl2 bg-white p-6 shadow-card">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-surface">
          <svg className="absolute h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-ink/5" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - scorePercent / 100)}
              strokeLinecap="round"
              className="text-brand-600 transition-all duration-500"
            />
          </svg>
          <span className="text-xl font-bold text-ink">{scorePercent}%</span>
        </div>
        <div>
          <p className="mb-1 font-semibold text-ink">Overall Score</p>
          <p className="text-sm text-ink/60">
            {correct} of {total_questions} questions answered correctly
            {incorrect_attempts > 0 &&
              ` (${incorrect_attempts} incorrect ${incorrect_attempts === 1 ? "attempt" : "attempts"} along the way)`}
            .
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl2 bg-white p-5 shadow-card">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle2 size={16} />
          </div>
          <p className="mb-1 text-[11px] font-semibold tracking-wide text-ink/40">CORRECT</p>
          <p className="text-2xl font-bold text-ink">{correct}</p>
        </div>
        <div className="rounded-xl2 bg-white p-5 shadow-card">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
            <XCircle size={16} />
          </div>
          <p className="mb-1 text-[11px] font-semibold tracking-wide text-ink/40">INCORRECT ATTEMPTS</p>
          <p className="text-2xl font-bold text-ink">{incorrect_attempts}</p>
        </div>
        <div className="rounded-xl2 bg-white p-5 shadow-card">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink/50">
            <SkipForward size={16} />
          </div>
          <p className="mb-1 text-[11px] font-semibold tracking-wide text-ink/40">SKIPPED</p>
          <p className="text-2xl font-bold text-ink">{skipped}</p>
        </div>
      </div>

      {performance_insight && (
        <div className="mb-8 flex items-start gap-3 rounded-xl2 border border-brand-100 bg-brand-50/50 p-5">
          <div className="mt-0.5 shrink-0 text-brand-600">
            <Lightbulb size={16} />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-ink">Performance Insights</p>
            <p className="text-sm leading-relaxed text-ink/70">{performance_insight}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl2 bg-brand-50/60 p-5 text-sm text-ink/70">
        <ListChecks size={16} className="shrink-0 text-brand-600" />
        <span>
          {total_questions} total questions in this module{completed ? " — all done." : "."}
        </span>
      </div>
    </div>
  );
}