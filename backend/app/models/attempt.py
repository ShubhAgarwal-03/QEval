import enum
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.db.database import Base


class AttemptResult(str, enum.Enum):
    CORRECT = "correct"
    INCORRECT = "incorrect"
    SKIPPED = "skipped"


class QuestionAttempt(Base):
    __tablename__ = "question_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("assessment_sessions.id"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id"), nullable=False)
    attempt_number = Column(Integer, nullable=False)
    answer_text = Column(String, nullable=True)  # null for skips
    result = Column(Enum(AttemptResult), nullable=False)

    # Backend-only fields (PRD §12): never serialized into a client-facing response.
    confidence = Column(Float, nullable=True)
    reason = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("AssessmentSession", back_populates="attempts")