from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.admin_auth import require_admin
from app.models.question import Question
from app.repositories import question_repo
from app.schemas.admin_schema import (
    QuestionAdminView,
    QuestionCreateRequest,
    QuestionUpdateRequest,
    ReorderRequest,
)

# Every route in this router requires a valid X-Admin-Key header (see
# core/admin_auth.py) - applied once here rather than per-endpoint.
router = APIRouter(
    prefix="/admin/questions",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


def _to_admin_view(question: Question) -> QuestionAdminView:
    return QuestionAdminView(
        id=question.id,
        question_text=question.question_text,
        expected_answer=question.expected_answer,
        topic=question.topic,
        difficulty=question.difficulty,
        order_index=question.order_index,
        required_concepts=[c.concept_text for c in question.required_concepts],
    )


@router.get("", response_model=list[QuestionAdminView])
def list_questions(db: Session = Depends(get_db)):
    return [_to_admin_view(q) for q in question_repo.list_all_questions(db)]


@router.post("", response_model=QuestionAdminView, status_code=201)
def create_question(payload: QuestionCreateRequest, db: Session = Depends(get_db)):
    if payload.id and question_repo.get_question_by_id(db, payload.id):
        raise HTTPException(status_code=400, detail="A question with this id already exists.")

    question = question_repo.create_question(
        db,
        question_text=payload.question_text,
        expected_answer=payload.expected_answer,
        topic=payload.topic,
        difficulty=payload.difficulty,
        required_concepts=payload.required_concepts,
        question_id=payload.id,
    )
    return _to_admin_view(question)


@router.post("/reorder", response_model=list[QuestionAdminView])
def reorder_questions(payload: ReorderRequest, db: Session = Depends(get_db)):
    question_repo.reorder_questions(db, payload.ordered_ids)
    return [_to_admin_view(q) for q in question_repo.list_all_questions(db)]


@router.get("/{question_id}", response_model=QuestionAdminView)
def get_question(question_id: str, db: Session = Depends(get_db)):
    question = question_repo.get_question_by_id(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found.")
    return _to_admin_view(question)


@router.put("/{question_id}", response_model=QuestionAdminView)
def update_question(question_id: str, payload: QuestionUpdateRequest, db: Session = Depends(get_db)):
    question = question_repo.get_question_by_id(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found.")

    question = question_repo.update_question(
        db,
        question,
        question_text=payload.question_text,
        expected_answer=payload.expected_answer,
        topic=payload.topic,
        difficulty=payload.difficulty,
        required_concepts=payload.required_concepts,
    )
    return _to_admin_view(question)


@router.delete("/{question_id}", status_code=204)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    question = question_repo.get_question_by_id(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found.")
    question_repo.delete_question(db, question)