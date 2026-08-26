export interface QuestionAdmin {
  id: string;
  question_text: string;
  expected_answer: string;
  topic?: string | null;
  difficulty?: string | null;
  order_index: number;
  required_concepts: string[];
}

export interface QuestionCreatePayload {
  id?: string;
  question_text: string;
  expected_answer: string;
  topic?: string | null;
  difficulty?: string | null;
  required_concepts: string[];
}

export interface QuestionUpdatePayload {
  question_text?: string;
  expected_answer?: string;
  topic?: string | null;
  difficulty?: string | null;
  required_concepts?: string[];
}