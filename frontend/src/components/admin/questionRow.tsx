import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { QuestionAdmin } from "../../types/admin";

interface QuestionRowProps {
  question: QuestionAdmin;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuestionRow({
  question,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: QuestionRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl2 bg-white p-4 shadow-card">
      <div className="flex flex-col text-ink/30">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="hover:text-ink disabled:opacity-20"
          aria-label="Move up"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="hover:text-ink disabled:opacity-20"
          aria-label="Move down"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{question.question_text}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {question.topic && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600">
              {question.topic}
            </span>
          )}
          {question.difficulty && (
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink/50">
              {question.difficulty}
            </span>
          )}
          {question.required_concepts.length > 0 && (
            <span className="text-[11px] text-ink/35">
              {question.required_concepts.length} required concept
              {question.required_concepts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/40 hover:bg-surface hover:text-ink"
          aria-label="Edit question"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/40 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete question"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}