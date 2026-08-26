from pydantic import BaseModel, Field

from app.schemas.question_schema import QuestionPublic, ProgressInfo


class AnswerSubmitRequest(BaseModel):
    answer: str = Field(..., min_length=1, max_length=4000)


class AnswerSubmitResponse(BaseModel):
    """
    Result returned to the frontend after submitting an answer.
    Note: no `confidence` or `reason` field — those stay server-side (PRD §12/§20).
    """

    result: str  # "correct" | "incorrect"
    message: str  # "Correct" | "Not quite. Try answering again."
    next_question: QuestionPublic | None = None  # populated only when result == "correct"
    progress: ProgressInfo
    status: str  # "in_progress" | "completed"


class SkipResponse(BaseModel):
    next_question: QuestionPublic | None
    progress: ProgressInfo
    status: str