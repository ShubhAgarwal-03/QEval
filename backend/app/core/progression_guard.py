"""
Progression Guard

This module contains ONLY the business rule for whether a user may advance
to the next question. It has no dependency on Gemini or any AI model, so it
can be unit tested in isolation and stays deterministic.

Rule (PRD §14):
    correct answer -> advance
    skip           -> advance
    incorrect      -> stay on the same question
"""

from enum import Enum


class AttemptOutcome(str, Enum):
    CORRECT = "correct"
    INCORRECT = "incorrect"
    SKIPPED = "skipped"


def should_advance(outcome: AttemptOutcome) -> bool:
    """Returns True if the assessment should move to the next question."""
    return outcome in (AttemptOutcome.CORRECT, AttemptOutcome.SKIPPED)


def next_question_index(current_index: int, outcome: AttemptOutcome) -> int:
    """Given the current pointer and an outcome, returns the new pointer.
    Does not know about total question count - callers are responsible for
    detecting "no more questions" using the returned index."""
    if should_advance(outcome):
        return current_index + 1
    return current_index