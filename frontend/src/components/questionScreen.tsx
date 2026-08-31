import { useState } from "react";
import { SkipForward, XCircle } from "lucide-react";
import ProgressHeader from "./progressHeader";
import AnswerInput from "./answerInput";
import EvaluationPanel from "./evualtionPanel";
import type { QuestionPublic, ProgressInfo } from "../types/assessment";

type Phase = "answering" | "submitting" | "correct" | "incorrect";

interface QuestionScreenProps {
  question: QuestionPublic;
  progress: ProgressInfo;
  onSubmitAnswer: (answer: string) => Promise<{ correct: boolean; message: string }>;
  onSkip: () => Promise<void>;
  onAdvance: () => void; // called after user clicks "Next Question" on a correct result
}

export default function QuestionScreen({
  question,
  progress,
  onSubmitAnswer,
  onSkip,
  onAdvance,
}: QuestionScreenProps) {
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [skipping, setSkipping] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim() || phase === "submitting") return;
    setPhase("submitting");
    try {
      const { correct, message } = await onSubmitAnswer(answer);
      setFeedbackMessage(message);
      setPhase(correct ? "correct" : "incorrect");
    } catch {
      setFeedbackMessage("Something went wrong evaluating that answer. Please try again.");
      setPhase("incorrect");
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      await onSkip();
      // Parent swaps in the next question via a fresh `question` prop;
      // reset local state for the new question.
      setAnswer("");
      setPhase("answering");
    } finally {
      setSkipping(false);
    }
  };

  const handleNext = () => {
    setAnswer("");
    // Don't reset phase here: if this was the last question, the parent
    // unmounts this component entirely (no next `question` prop comes in),
    // so resetting to "answering" only caused a flash of the stale question
    // before that unmount. The `key={question.id}` remount on the parent
    // already resets phase correctly when there IS a next question.
    onAdvance();
  };

  const showSidePanel = phase === "correct";

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-8 py-10">
      <div className="flex-1">
        <ProgressHeader currentNumber={progress.current_number} total={progress.total} />

        <h1 className="mb-6 text-2xl font-bold text-ink">{question.question_text}</h1>

        {phase === "correct" ? (
          <div className="rounded-xl2 border border-emerald-200 bg-emerald-50/50 p-1">
            <p className="px-4 pt-3 text-sm font-semibold text-emerald-700">
              ✓ Correct! Moving to next question…
            </p>
            <div className="m-3 rounded-lg bg-white p-4 text-[15px] leading-relaxed text-ink/80">
              {answer}
            </div>
          </div>
        ) : (
          <>
            <AnswerInput
              value={answer}
              onChange={setAnswer}
              disabled={phase === "submitting"}
            />
            {phase === "incorrect" && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                <XCircle size={16} />
                <div>
                  <p className="font-semibold">Not quite</p>
                  <p className="text-red-500/80">Try answering again.</p>
                </div>
              </div>
            )}
          </>
        )}

        {phase !== "correct" && (
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={handleSkip}
              disabled={skipping || phase === "submitting"}
              className="flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-ink disabled:opacity-50"
            >
              <SkipForward size={15} />
              {skipping ? "Skipping…" : "Skip Question"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || phase === "submitting"}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === "submitting" ? "Evaluating…" : "Submit Answer"}
              {phase !== "submitting" && <span aria-hidden>→</span>}
            </button>
          </div>
        )}
      </div>

      {showSidePanel && (
        <EvaluationPanel message={feedbackMessage} onNext={handleNext} />
      )}
    </div>
  );
}