import { useState } from "react";
import { X } from "lucide-react";
import type { QuestionAdmin, QuestionCreatePayload, QuestionUpdatePayload } from "../../types/admin";

interface QuestionFormPanelProps {
  initial?: QuestionAdmin; // omitted => create mode
  onCancel: () => void;
  onSubmit: (payload: QuestionCreatePayload | QuestionUpdatePayload) => Promise<void>;
}

export default function QuestionFormPanel({ initial, onCancel, onSubmit }: QuestionFormPanelProps) {
  const [questionText, setQuestionText] = useState(initial?.question_text ?? "");
  const [expectedAnswer, setExpectedAnswer] = useState(initial?.expected_answer ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "");
  const [conceptsInput, setConceptsInput] = useState((initial?.required_concepts ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const required_concepts = conceptsInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        question_text: questionText.trim(),
        expected_answer: expectedAnswer.trim(),
        topic: topic.trim() || null,
        difficulty: difficulty.trim() || null,
        required_concepts,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl2 bg-white p-6 shadow-card"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">
            {isEdit ? "Edit question" : "Add question"}
          </h3>
          <button type="button" onClick={onCancel} className="text-ink/40 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-ink/50">Question</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            rows={2}
            className="w-full resize-none rounded-lg border border-ink/10 bg-white p-3 text-sm shadow-card"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-ink/50">
            Expected answer <span className="font-normal text-ink/35">(hidden from candidates)</span>
          </label>
          <textarea
            value={expectedAnswer}
            onChange={(e) => setExpectedAnswer(e.target.value)}
            required
            rows={3}
            className="w-full resize-none rounded-lg border border-ink/10 bg-white p-3 text-sm shadow-card"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink/50">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. DBMS"
              className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm shadow-card"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink/50">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm shadow-card"
            >
              <option value="">—</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold text-ink/50">
            Required concepts <span className="font-normal text-ink/35">(comma-separated, optional)</span>
          </label>
          <input
            value={conceptsInput}
            onChange={(e) => setConceptsInput(e.target.value)}
            placeholder="e.g. LIFO, data structure"
            className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm shadow-card"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !questionText.trim() || !expectedAnswer.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add question"}
          </button>
        </div>
      </form>
    </div>
  );
}