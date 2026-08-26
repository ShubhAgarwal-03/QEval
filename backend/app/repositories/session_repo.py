from sqlalchemy.orm import Session

from app.models.session import AssessmentSession, SessionStatus


def create_session(db: Session, user_id: str | None = None) -> AssessmentSession:
    session = AssessmentSession(user_id=user_id, current_question_index=0)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session(db: Session, session_id: str) -> AssessmentSession | None:
    return db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()


def advance_session(db: Session, session: AssessmentSession, new_index: int, total_questions: int) -> AssessmentSession:
    session.current_question_index = new_index
    if new_index >= total_questions:
        session.status = SessionStatus.COMPLETED
    db.commit()
    db.refresh(session)
    return session