import type {
  AnswerSubmitResponse,
  CurrentQuestionResponse,
  SkipResponse,
  SummaryResponse,
} from "../types/assessment";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.detail ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const assessmentApi = {
  start: (userId?: string) =>
    request<CurrentQuestionResponse>(
      `/assessments/start${userId ? `?user_id=${encodeURIComponent(userId)}` : ""}`,
      { method: "POST" }
    ),

  getCurrent: (sessionId: string) =>
    request<CurrentQuestionResponse>(`/assessments/${sessionId}/current`),

  submitAnswer: (sessionId: string, answer: string) =>
    request<AnswerSubmitResponse>(`/assessments/${sessionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),

  skip: (sessionId: string) =>
    request<SkipResponse>(`/assessments/${sessionId}/skip`, { method: "POST" }),

  getSummary: (sessionId: string) =>
    request<SummaryResponse>(`/assessments/${sessionId}/summary`),
};