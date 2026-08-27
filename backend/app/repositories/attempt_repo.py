from sqlalchemy.orm import Session

from app.models.attempt import QuestionAttempt, AttemptResult


def get_next_attempt_number(db: Session, session_id: str, question_id: str) -> int:
    count = (
        db.query(QuestionAttempt)
        .filter(
            QuestionAttempt.session_id == session_id,
            QuestionAttempt.question_id == question_id,
        )
        .count()
    )
    return count + 1


def record_attempt(
    db: Session,
    session_id: str,
    question_id: str,
    answer_text: str | None,
    result: AttemptResult,
    confidence: float | None = None,
    reason: str | None = None,
) -> QuestionAttempt:
    attempt = QuestionAttempt(
        session_id=session_id,
        question_id=question_id,
        attempt_number=get_next_attempt_number(db, session_id, question_id),
        answer_text=answer_text,
        result=result,
        confidence=confidence,
        reason=reason,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


def get_session_attempts(db: Session, session_id: str) -> list[QuestionAttempt]:
    return (
        db.query(QuestionAttempt)
        .filter(QuestionAttempt.session_id == session_id)
        .all()
    )