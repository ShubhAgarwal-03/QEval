"""
This is the single place in the codebase where evaluator `reason` and
`confidence` values are written anywhere. Per PRD §12/§20 these must be
available for backend/debugging purposes but NEVER exposed to the client.
Route handlers should never print or return these fields directly - always
go through this logger so the boundary stays in one place.
"""

import logging

logger = logging.getLogger("evaluator.decisions")


def log_evaluation(
    question_id: str,
    question_text: str,
    user_answer: str,
    correct: bool,
    confidence: float,
    reason: str,
) -> None:
    logger.info(
        "[Evaluator]\nQuestion (%s): %s\nAnswer: %r\nResult: %s\nConfidence: %.2f\nReason: %s",
        question_id,
        question_text,
        user_answer,
        "CORRECT" if correct else "INCORRECT",
        confidence,
        reason,
    )