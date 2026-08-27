import { useEffect, useState } from "react";
import { Plus, LogOut } from "lucide-react";
import AdminKeyGate, { getStoredAdminKey, clearStoredAdminKey } from "./adminkeyGate";
import QuestionRow from "./questionRow";
import QuestionFormPanel from "./questionFormPanel";
import { adminApi, AdminApiError } from "../../api/adminApi";
import type { QuestionAdmin, QuestionCreatePayload, QuestionUpdatePayload } from "../../types/admin";

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState<string | null>(getStoredAdminKey());
  const [questions, setQuestions] = useState<QuestionAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<QuestionAdmin | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadQuestions = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.list(key);
      setQuestions(data);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        clearStoredAdminKey();
        setAdminKey(null);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load questions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) loadQuestions(adminKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  if (!adminKey) {
    return <AdminKeyGate onUnlock={setAdminKey} />;
  }

  const handleCreate = async (payload: QuestionCreatePayload | QuestionUpdatePayload) => {
    await adminApi.create(adminKey, payload as QuestionCreatePayload);
    setEditing(null);
    await loadQuestions(adminKey);
  };

  const handleUpdate = async (id: string, payload: QuestionCreatePayload | QuestionUpdatePayload) => {
    await adminApi.update(adminKey, id, payload as QuestionUpdatePayload);
    setEditing(null);
    await loadQuestions(adminKey);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await adminApi.remove(adminKey, id);
      await loadQuestions(adminKey);
    } finally {
      setDeletingId(null);
    }
  };

  const swap = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const reordered = [...questions];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setQuestions(reordered); // optimistic update

    try {
      await adminApi.reorder(
        adminKey,
        reordered.map((q) => q.id)
      );
    } catch {
      await loadQuestions(adminKey); // roll back to server state on failure
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Questions</h1>
          <p className="text-sm text-ink/50">
            {questions.length} question{questions.length !== 1 ? "s" : ""} in the assessment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus size={16} />
            Add question
          </button>
          <button
            onClick={() => {
              clearStoredAdminKey();
              setAdminKey(null);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/40 hover:bg-surface hover:text-ink"
            aria-label="Lock admin panel"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-ink/40">Loading questions…</p>
      ) : questions.length === 0 ? (
        <div className="rounded-xl2 bg-white p-8 text-center text-sm text-ink/50 shadow-card">
          No questions yet. Add your first one to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((q, index) => (
            <QuestionRow
              key={q.id}
              question={q}
              index={index}
              total={questions.length}
              onMoveUp={() => swap(index, -1)}
              onMoveDown={() => swap(index, 1)}
              onEdit={() => setEditing(q)}
              onDelete={() => handleDelete(q.id)}
            />
          ))}
        </div>
      )}

      {deletingId && <p className="mt-3 text-xs text-ink/40">Deleting…</p>}

      {editing === "new" && (
        <QuestionFormPanel onCancel={() => setEditing(null)} onSubmit={handleCreate} />
      )}
      {editing && editing !== "new" && (
        <QuestionFormPanel
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload)}
        />
      )}
    </div>
  );
}