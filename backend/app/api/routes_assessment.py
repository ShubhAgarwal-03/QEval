from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.attempt import AttemptResult
from app.repositories import question_repo, session_repo, attempt_repo
from app.schemas.question_schema import (
    QuestionPublic,
    ProgressInfo,
    CurrentQuestionResponse,
    SummaryResponse,
)

router = APIRouter(prefix="/assessments", tags=["assessment"])


def _build_current_question_response(db: Session, session) -> CurrentQuestionResponse:
    total = question_repo.get_total_question_count(db)
    question = question_repo.get_question_by_index(db, session.current_question_index)

    question_public = (
        QuestionPublic(
            id=question.id,
            question_text=question.question_text,
            topic=question.topic,
            difficulty=question.difficulty,
        )
        if question is not None
        else None
    )

    return CurrentQuestionResponse(
        session_id=session.id,
        question=question_public,
        progress=ProgressInfo(
            current_number=min(session.current_question_index + 1, total),
            total=total,
        ),
        status=session.status.value,
    )


@router.post("/start", response_model=CurrentQuestionResponse)
def start_assessment(user_id: str | None = None, db: Session = Depends(get_db)):
    session = session_repo.create_session(db, user_id=user_id)
    return _build_current_question_response(db, session)


@router.get("/{session_id}/current", response_model=CurrentQuestionResponse)
def get_current_question(session_id: str, db: Session = Depends(get_db)):
    session = session_repo.get_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return _build_current_question_response(db, session)


@router.get("/{session_id}/summary", response_model=SummaryResponse)
def get_summary(session_id: str, db: Session = Depends(get_db)):
    session = session_repo.get_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    total = question_repo.get_total_question_count(db)
    attempts = attempt_repo.get_session_attempts(db, session_id)

    correct = len({a.question_id for a in attempts if a.result == AttemptResult.CORRECT})
    skipped = len({a.question_id for a in attempts if a.result == AttemptResult.SKIPPED})
    incorrect_attempts = sum(1 for a in attempts if a.result == AttemptResult.INCORRECT)

    return SummaryResponse(
        total_questions=total,
        correct=correct,
        incorrect_attempts=incorrect_attempts,
        skipped=skipped,
        completed=session.status.value == "completed",
    )