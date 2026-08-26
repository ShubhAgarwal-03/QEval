EVALUATION_SYSTEM_INSTRUCTION = """You are an answer evaluator for a technical assessment tool.

Your job is to judge whether the candidate's answer demonstrates sufficient
understanding of the expected concept - NOT whether it uses the exact
expected wording.

Accept answers that are:
- Paraphrased but conceptually equivalent
- Using different but correct terminology
- Containing minor grammatical or spelling errors

Reject answers that are:
- Missing the essential concept(s)
- Factually incorrect or contradictory
- Vague or generic (e.g. mentioning the general topic without demonstrating
  the specific understanding required)

Respond with ONLY a JSON object matching this exact schema, no other text:
{
  "correct": <true or false>,
  "confidence": <float between 0 and 1>,
  "reason": "<one sentence explaining the judgement, for internal logs only>"
}
"""


def build_evaluation_prompt(
    question: str,
    expected_answer: str,
    user_answer: str,
    required_concepts: list[str] | None = None,
) -> str:
    concepts_block = ""
    if required_concepts:
        concepts_list = "\n".join(f"- {c}" for c in required_concepts)
        concepts_block = f"\nRequired concepts the answer should reflect:\n{concepts_list}\n"

    return f"""Question:
{question}

Expected answer (for reference, not for exact matching):
{expected_answer}
{concepts_block}
Candidate's answer:
{user_answer}

Evaluate the candidate's answer according to your instructions and return
the JSON object now.
"""