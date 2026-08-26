import type { QuestionAdmin, QuestionCreatePayload, QuestionUpdatePayload } from "../types/admin";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function adminRequest<T>(
  adminKey: string,
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": adminKey,
    },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new AdminApiError(detail.detail ?? `Request failed: ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const adminApi = {
  list: (adminKey: string) => adminRequest<QuestionAdmin[]>(adminKey, "/admin/questions"),

  create: (adminKey: string, payload: QuestionCreatePayload) =>
    adminRequest<QuestionAdmin>(adminKey, "/admin/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (adminKey: string, id: string, payload: QuestionUpdatePayload) =>
    adminRequest<QuestionAdmin>(adminKey, `/admin/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  remove: (adminKey: string, id: string) =>
    adminRequest<void>(adminKey, `/admin/questions/${id}`, { method: "DELETE" }),

  reorder: (adminKey: string, orderedIds: string[]) =>
    adminRequest<QuestionAdmin[]>(adminKey, "/admin/questions/reorder", {
      method: "POST",
      body: JSON.stringify({ ordered_ids: orderedIds }),
    }),
};

export { AdminApiError };