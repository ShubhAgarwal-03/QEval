"""
Evaluator Service

Thin wrapper around the Gemini API. Isolated here so it can be swapped for
a different model later without touching route/business logic, and so it
can be mocked easily in tests.
"""

import json
import logging
from dataclasses import dataclass

import google.generativeai as genai

from app.core.config import get_settings
from app.evaluator.prompt_templates import (
    EVALUATION_SYSTEM_INSTRUCTION,
    build_evaluation_prompt,
)

logger = logging.getLogger("evaluator")


@dataclass
class EvaluationResult:
    correct: bool
    confidence: float
    reason: str


class EvaluatorService:
    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        settings = get_settings()
        self.api_key = api_key or settings.gemini_api_key
        self.model_name = model_name or settings.gemini_model
        self._model = None  # lazy-initialized so tests can construct this without a key

    def _get_model(self):
        if self._model is None:
            genai.configure(api_key=self.api_key)
            self._model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=EVALUATION_SYSTEM_INSTRUCTION,
                generation_config={
                    "response_mime_type": "application/json",
                    "thinking_config": {"thinking_budget": 512},
                    },
            )
        return self._model

    def evaluate(
        self,
        question: str,
        expected_answer: str,
        user_answer: str,
        required_concepts: list[str] | None = None,
    ) -> EvaluationResult:
        prompt = build_evaluation_prompt(
            question=question,
            expected_answer=expected_answer,
            user_answer=user_answer,
            required_concepts=required_concepts,
        )

        try:
            model = self._get_model()
            response = model.generate_content(prompt)
            return self._parse_response(response.text)
        except Exception as exc:  # noqa: BLE001 - fail-safe boundary, must not raise
            logger.exception("Gemini evaluation call failed: %s", exc)
            return self._fallback_result(reason=f"Evaluator error: {exc}")

    def _parse_response(self, raw_text: str) -> EvaluationResult:
        try:
            data = json.loads(raw_text)
            return EvaluationResult(
                correct=bool(data["correct"]),
                confidence=float(data.get("confidence", 0.0)),
                reason=str(data.get("reason", "")),
            )
        except (json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
            logger.error("Failed to parse evaluator response: %s | raw=%s", exc, raw_text)
            return self._fallback_result(reason="Malformed evaluator response")

    @staticmethod
    def _fallback_result(reason: str) -> EvaluationResult:
        # Fail safe: never silently mark an answer correct on error.
        # The user simply gets to retry, per PRD (they can never be stuck).
        return EvaluationResult(correct=False, confidence=0.0, reason=reason)