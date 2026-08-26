interface ProgressHeaderProps {
  currentNumber: number;
  total: number;
}

export default function ProgressHeader({ currentNumber, total }: ProgressHeaderProps) {
  const percent = total > 0 ? Math.round((currentNumber / total) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-ink/40">
          QUESTION {currentNumber} OF {total}
        </span>
        <span className="text-xs font-semibold text-brand-600">{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}