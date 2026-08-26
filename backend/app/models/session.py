import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base


class SessionStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)  # nullable: anonymous sessions allowed for MVP
    current_question_index = Column(Integer, nullable=False, default=0)
    status = Column(Enum(SessionStatus), nullable=False, default=SessionStatus.IN_PROGRESS)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("QuestionAttempt", back_populates="session", cascade="all, delete-orphan")