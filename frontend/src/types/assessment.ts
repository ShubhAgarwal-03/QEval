export interface QuestionPublic {
  id: string;
  question_text: string;
  topic?: string | null;
  difficulty?: string | null;
}

export interface ProgressInfo {
  current_number: number;
  total: number;
}

export type SessionStatus = "in_progress" | "completed";

export interface CurrentQuestionResponse {
  session_id: string;
  question: QuestionPublic | null;
  progress: ProgressInfo;
  status: SessionStatus;
}

export type AnswerResult = "correct" | "incorrect";

export interface AnswerSubmitResponse {
  result: AnswerResult;
  message: string;
  next_question: QuestionPublic | null;
  progress: ProgressInfo;
  status: SessionStatus;
}

export interface SkipResponse {
  next_question: QuestionPublic | null;
  progress: ProgressInfo;
  status: SessionStatus;
}

export interface SummaryResponse {
  total_questions: number;
  correct: number;
  incorrect_attempts: number;
  skipped: number;
  completed: boolean;
  performance_insight?: string | null;
}