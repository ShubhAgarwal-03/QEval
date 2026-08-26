import json
from unittest.mock import MagicMock

from app.evaluator.evaluator_service import EvaluatorService


def _make_service_with_mock_response(response_text: str) -> EvaluatorService:
    service = EvaluatorService(api_key="fake-key")
    mock_model = MagicMock()
    mock_model.generate_content.return_value = MagicMock(text=response_text)
    service._model = mock_model  # bypass genai.configure/model creation
    return service


def test_evaluate_parses_correct_result():
    response_text = json.dumps(
        {"correct": True, "confidence": 0.94, "reason": "Matches the concept."}
    )
    service = _make_service_with_mock_response(response_text)

    result = service.evaluate(
        question="What is a stack?",
        expected_answer="A stack is a LIFO data structure.",
        user_answer="The last element added is the first one removed.",
    )

    assert result.correct is True
    assert result.confidence == 0.94
    assert "concept" in result.reason.lower()


def test_evaluate_parses_incorrect_result():
    response_text = json.dumps(
        {"correct": False, "confidence": 0.88, "reason": "Missing the LIFO concept."}
    )
    service = _make_service_with_mock_response(response_text)

    result = service.evaluate(
        question="What is a stack?",
        expected_answer="A stack is a LIFO data structure.",
        user_answer="It is something used in programming.",
    )

    assert result.correct is False
    assert result.confidence == 0.88


def test_evaluate_fails_safe_on_malformed_json():
    service = _make_service_with_mock_response("not valid json")

    result = service.evaluate(
        question="What is a stack?",
        expected_answer="A stack is a LIFO data structure.",
        user_answer="Something",
    )

    # Fail-safe: never silently marks correct when the model output is unusable.
    assert result.correct is False


def test_evaluate_fails_safe_on_exception():
    service = EvaluatorService(api_key="fake-key")
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = RuntimeError("network error")
    service._model = mock_model

    result = service.evaluate(
        question="What is a stack?",
        expected_answer="A stack is a LIFO data structure.",
        user_answer="Something",
    )

    assert result.correct is False
    assert "error" in result.reason.lower()