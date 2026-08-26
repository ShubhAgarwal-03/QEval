import json
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.question import Question, RequiredConcept


def seed_questions_if_empty(db: Session, seed_path: str) -> None:
    """Loads the predefined question set from JSON into the DB on startup,
    if the questions table is currently empty. Safe to call every boot."""
    if db.query(Question).first() is not None:
        return  # already seeded

    path = Path(seed_path)
    with path.open() as f:
        raw_questions = json.load(f)

    for index, item in enumerate(raw_questions):
        question = Question(
            id=item["id"],
            question_text=item["question"],
            expected_answer=item["expected_answer"],
            topic=item.get("topic"),
            difficulty=item.get("difficulty"),
            order_index=index,
        )
        for concept in item.get("required_concepts", []):
            question.required_concepts.append(RequiredConcept(concept_text=concept))
        db.add(question)

    db.commit()


def get_total_question_count(db: Session) -> int:
    return db.query(Question).count()


def get_question_by_index(db: Session, index: int) -> Question | None:
    return (
        db.query(Question)
        .order_by(Question.order_index)
        .offset(index)
        .limit(1)
        .first()
    )


def get_question_by_id(db: Session, question_id: str) -> Question | None:
    return db.query(Question).filter(Question.id == question_id).first()


# ---------------------------------------------------------------------------
# Admin CRUD
# ---------------------------------------------------------------------------


def list_all_questions(db: Session) -> list[Question]:
    return db.query(Question).order_by(Question.order_index).all()


def _next_order_index(db: Session) -> int:
    # New questions go at the end. Positional (COUNT-based), so it stays
    # correct even though order_index values can have gaps after deletes.
    return db.query(Question).count()


def create_question(
    db: Session,
    question_text: str,
    expected_answer: str,
    topic: str | None,
    difficulty: str | None,
    required_concepts: list[str],
    question_id: str | None = None,
) -> Question:
    question = Question(
        id=question_id or f"q_{uuid.uuid4().hex[:8]}",
        question_text=question_text,
        expected_answer=expected_answer,
        topic=topic,
        difficulty=difficulty,
        order_index=_next_order_index(db),
    )
    for concept in required_concepts:
        question.required_concepts.append(RequiredConcept(concept_text=concept))

    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def update_question(
    db: Session,
    question: Question,
    question_text: str | None,
    expected_answer: str | None,
    topic: str | None,
    difficulty: str | None,
    required_concepts: list[str] | None,
) -> Question:
    if question_text is not None:
        question.question_text = question_text
    if expected_answer is not None:
        question.expected_answer = expected_answer
    if topic is not None:
        question.topic = topic
    if difficulty is not None:
        question.difficulty = difficulty
    if required_concepts is not None:
        # cascade="all, delete-orphan" on the relationship means clearing +
        # re-adding cleanly replaces the concept set in one transaction.
        question.required_concepts.clear()
        for concept in required_concepts:
            question.required_concepts.append(RequiredConcept(concept_text=concept))

    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question: Question) -> None:
    # Note: order_index gaps left behind are fine - get_question_by_index()
    # uses a positional OFFSET, not the raw order_index value, so progression
    # for in-flight sessions is unaffected by a gap.
    db.delete(question)
    db.commit()


def reorder_questions(db: Session, ordered_ids: list[str]) -> None:
    questions_by_id = {q.id: q for q in db.query(Question).all()}

    # Two-phase update: first move everything to negative placeholder values,
    # then set final positions. Avoids any transient collision if order_index
    # ever gets a uniqueness constraint added back at the DB level later.
    for question_id in ordered_ids:
        question = questions_by_id.get(question_id)
        if question is not None:
            question.order_index = -(question.order_index + 1)
    db.flush()

    for index, question_id in enumerate(ordered_ids):
        question = questions_by_id.get(question_id)
        if question is not None:
            question.order_index = index

    db.commit()