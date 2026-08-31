import { useState } from "react";
import { SkipForward, XCircle, HelpCircle } from "lucide-react";
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
  onAdvance: () => void;
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
      setAnswer("");
      setPhase("answering");
    } finally {
      setSkipping(false);
    }
  };

  const handleNext = () => {
    setAnswer("");
    onAdvance();
  };

  const showSidePanel = phase === "correct";

  return (
    <div className="mx-auto flex w-full flex-col gap-6 px-4 py-6 md:max-w-5xl md:flex-row md:gap-8 md:px-8 md:py-10">
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <ProgressHeader currentNumber={progress.current_number} total={progress.total} />
          {question.topic && (
            <span className="ml-4 shrink-0 whitespace-nowrap rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
              {question.topic}
            </span>
          )}
        </div>

        <div className="mb-6 rounded-xl2 bg-white p-6 shadow-card">
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-2xl font-bold text-ink">{question.question_text}</h1>
            <HelpCircle size={16} className="mt-1.5 shrink-0 text-ink/25" />
          </div>
          {question.difficulty && (
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
              Complexity: {question.difficulty}
            </p>
          )}
        </div>

        {phase === "correct" ? (
          <div className="rounded-xl2 border border-emerald-200 bg-emerald-50/50 p-1">
            <p className="px-4 pt-3 text-sm font-semibold text-emerald-700">
              ✓ Correct! Moving to next question…
            </p>
            <p className="mx-3 mt-2 text-[11px] font-semibold tracking-wide text-ink/40">
              YOUR RESPONSE
            </p>
            <div className="m-3 mt-1 rounded-lg bg-white p-4 text-[15px] leading-relaxed text-ink/80">
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