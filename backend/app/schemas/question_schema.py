from pydantic import BaseModel


class QuestionPublic(BaseModel):
    """
    Client-facing view of a question.
    Deliberately omits `expected_answer` and `required_concepts` —
    those are evaluator inputs only, never sent to the frontend.
    """

    id: str
    question_text: str
    topic: str | None = None
    difficulty: str | None = None


class ProgressInfo(BaseModel):
    current_number: int  # 1-indexed, for display: "Question 4 of 15"
    total: int


class CurrentQuestionResponse(BaseModel):
    session_id: str
    question: QuestionPublic | None  # None when the assessment is complete
    progress: ProgressInfo
    status: str  # "in_progress" | "completed"


class SummaryResponse(BaseModel):
    total_questions: int
    correct: int
    incorrect_attempts: int
    skipped: int
    completed: bool