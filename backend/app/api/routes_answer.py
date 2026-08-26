from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.progression_guard import AttemptOutcome, next_question_index
from app.evaluator.evaluator_service import EvaluatorService
from app.logging.evaluator_logger import log_evaluation
from app.models.attempt import AttemptResult
from app.repositories import question_repo, session_repo, attempt_repo
from app.schemas.answer_schema import (
    AnswerSubmitRequest,
    AnswerSubmitResponse,
    SkipResponse,
)
from app.schemas.question_schema import QuestionPublic, ProgressInfo

router = APIRouter(prefix="/assessments", tags=["answer"])


def get_evaluator_service() -> EvaluatorService:
    # Simple factory; swap for a cached singleton if instantiation becomes costly.
    return EvaluatorService()


def _to_public_question(question) -> QuestionPublic | None:
    if question is None:
        return None
    return QuestionPublic(
        id=question.id,
        question_text=question.question_text,
        topic=question.topic,
        difficulty=question.difficulty,
    )


def _require_active_session_and_question(db: Session, session_id: str):
    session = session_repo.get_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status.value == "completed":
        raise HTTPException(status_code=400, detail="Assessment already completed")

    question = question_repo.get_question_by_index(db, session.current_question_index)
    if question is None:
        raise HTTPException(status_code=400, detail="No active question for this session")

    return session, question


@router.post("/{session_id}/answer", response_model=AnswerSubmitResponse)
def submit_answer(
    session_id: str,
    payload: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    evaluator: EvaluatorService = Depends(get_evaluator_service),
):
    session, question = _require_active_session_and_question(db, session_id)

    required_concepts = [c.concept_text for c in question.required_concepts]

    evaluation = evaluator.evaluate(
        question=question.question_text,
        expected_answer=question.expected_answer,
        user_answer=payload.answer,
        required_concepts=required_concepts,
    )

    # Backend-only logging - reason/confidence never enter the API response.
    log_evaluation(
        question_id=question.id,
        question_text=question.question_text,
        user_answer=payload.answer,
        correct=evaluation.correct,
        confidence=evaluation.confidence,
        reason=evaluation.reason,
    )

    outcome = AttemptOutcome.CORRECT if evaluation.correct else AttemptOutcome.INCORRECT
    attempt_repo.record_attempt(
        db,
        session_id=session.id,
        question_id=question.id,
        answer_text=payload.answer,
        result=AttemptResult.CORRECT if evaluation.correct else AttemptResult.INCORRECT,
        confidence=evaluation.confidence,
        reason=evaluation.reason,
    )

    total = question_repo.get_total_question_count(db)
    new_index = next_question_index(session.current_question_index, outcome)
    session = session_repo.advance_session(db, session, new_index, total)

    next_question = None
    if outcome == AttemptOutcome.CORRECT:
        next_question = _to_public_question(
            question_repo.get_question_by_index(db, session.current_question_index)
        )

    return AnswerSubmitResponse(
        result=outcome.value,
        message="Correct" if evaluation.correct else "Not quite. Try answering again.",
        next_question=next_question,
        progress=ProgressInfo(
            current_number=min(session.current_question_index + 1, total),
            total=total,
        ),
        status=session.status.value,
    )


@router.post("/{session_id}/skip", response_model=SkipResponse)
def skip_question(session_id: str, db: Session = Depends(get_db)):
    session, question = _require_active_session_and_question(db, session_id)

    attempt_repo.record_attempt(
        db,
        session_id=session.id,
        question_id=question.id,
        answer_text=None,
        result=AttemptResult.SKIPPED,
    )

    total = question_repo.get_total_question_count(db)
    new_index = next_question_index(session.current_question_index, AttemptOutcome.SKIPPED)
    session = session_repo.advance_session(db, session, new_index, total)

    next_question = _to_public_question(
        question_repo.get_question_by_index(db, session.current_question_index)
    )

    return SkipResponse(
        next_question=next_question,
        progress=ProgressInfo(
            current_number=min(session.current_question_index + 1, total),
            total=total,
        ),
        status=session.status.value,
    )