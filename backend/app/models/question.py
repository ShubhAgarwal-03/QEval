from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True)  # e.g. "q001", matches predefined seed IDs
    question_text = Column(String, nullable=False)
    expected_answer = Column(String, nullable=False)  # NEVER exposed via API schemas
    topic = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    order_index = Column(Integer, nullable=False)

    required_concepts = relationship(
        "RequiredConcept", back_populates="question", cascade="all, delete-orphan"
    )


class RequiredConcept(Base):
    __tablename__ = "required_concepts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(String, ForeignKey("questions.id"), nullable=False)
    concept_text = Column(String, nullable=False)

    question = relationship("Question", back_populates="required_concepts")