from pydantic import BaseModel, Field, ConfigDict


class QuestionAdminView(BaseModel):
    """
    Full view of a question, for admin use only.
    Unlike QuestionPublic (schemas/question_schema.py), this intentionally
    includes expected_answer and required_concepts - only requests carrying
    a valid admin key reach these routes at all.
    """

    model_config = ConfigDict(from_attributes=True)

    id: str
    question_text: str
    expected_answer: str
    topic: str | None = None
    difficulty: str | None = None
    order_index: int
    required_concepts: list[str] = []


class QuestionCreateRequest(BaseModel):
    id: str | None = None  # auto-generated (q_<random>) if omitted
    question_text: str = Field(..., min_length=1, max_length=500)
    expected_answer: str = Field(..., min_length=1, max_length=2000)
    topic: str | None = None
    difficulty: str | None = None
    required_concepts: list[str] = []


class QuestionUpdateRequest(BaseModel):
    """All fields optional - only provided fields are changed (PATCH-style via PUT)."""

    question_text: str | None = Field(default=None, min_length=1, max_length=500)
    expected_answer: str | None = Field(default=None, min_length=1, max_length=2000)
    topic: str | None = None
    difficulty: str | None = None
    required_concepts: list[str] | None = None


class ReorderRequest(BaseModel):
    ordered_ids: list[str] = Field(..., min_length=1)