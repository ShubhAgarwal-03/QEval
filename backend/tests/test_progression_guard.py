from app.core.progression_guard import AttemptOutcome, should_advance, next_question_index


def test_correct_advances():
    assert should_advance(AttemptOutcome.CORRECT) is True


def test_skipped_advances():
    assert should_advance(AttemptOutcome.SKIPPED) is True


def test_incorrect_does_not_advance():
    assert should_advance(AttemptOutcome.INCORRECT) is False


def test_next_question_index_on_correct():
    assert next_question_index(3, AttemptOutcome.CORRECT) == 4


def test_next_question_index_on_skip():
    assert next_question_index(3, AttemptOutcome.SKIPPED) == 4


def test_next_question_index_on_incorrect_stays_put():
    assert next_question_index(3, AttemptOutcome.INCORRECT) == 3