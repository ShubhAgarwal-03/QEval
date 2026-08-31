import { useState } from "react";
import { X } from "lucide-react";
import Sidebar from "../components/sideBar";
import TopBar from "../components/topBar";
import WelcomeScreen from "../components/welcomeScreen";
import QuestionScreen from "../components/questionScreen";
import CompletionScreen from "../components/completionScreen";
import ResultsDashboard from "../components/resultsDashboard";
import AdminPanel from "../components/admin/adminPanel";
import { assessmentApi } from "../api/assessmentApi";
import type { QuestionPublic, ProgressInfo, SummaryResponse } from "../types/assessment";

type NavItem = "assessment" | "instructions" | "resources" | "notes" | "admin";

export default function Assessment() {
  const [navItem, setNavItem] = useState<NavItem>("instructions");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<QuestionPublic | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [status, setStatus] = useState<"in_progress" | "completed" | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<QuestionPublic | null>(null);
  const [pendingCompletion, setPendingCompletion] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    setStartError(null);
    try {
      const res = await assessmentApi.start();
      setSessionId(res.session_id);
      setQuestion(res.question);
      setProgress(res.progress);
      setStatus(res.status);
      setNavItem("assessment");
    } catch (err) {
      setStartError(
        err instanceof Error
          ? err.message
          : "Could not start the assessment. Please try again."
      );
    } finally {
      setStarting(false);
    }
  };

  const finishIfComplete = async (id: string, newStatus: string) => {
    if (newStatus === "completed") {
      const s = await assessmentApi.getSummary(id);
      setSummary(s);
      setQuestion(null);
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!sessionId) throw new Error("No active session");
    const res = await assessmentApi.submitAnswer(sessionId, answer);
    setProgress(res.progress);
    setStatus(res.status);
    if (res.result === "correct") {
      setPendingNextQuestion(res.next_question);
      setPendingCompletion(res.status === "completed");
    }
    return { correct: res.result === "correct", message: res.message };
  };

  const handleSkip = async () => {
    if (!sessionId) return;
    const res = await assessmentApi.skip(sessionId);
    setProgress(res.progress);
    setStatus(res.status);
    setQuestion(res.next_question);
    await finishIfComplete(sessionId, res.status);
  };

  const handleAdvance = async () => {
    if (pendingCompletion && sessionId) {
      await finishIfComplete(sessionId, "completed");
    } else {
      setQuestion(pendingNextQuestion);
    }
    setPendingNextQuestion(null);
    setPendingCompletion(false);
  };

  const inProgress = Boolean(sessionId && question && progress);

  return (
    <div className="flex h-screen w-full bg-surface">
      <div className="hidden md:flex">
        <Sidebar
          activeItem={navItem}
          onNavigate={setNavItem}
          canSubmitFinal={status === "in_progress"}
          onSubmitFinal={async () => {
            if (!sessionId) return;
            const s = await assessmentApi.getSummary(sessionId);
            setSummary(s);
            setShowComplete(true);
          }}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="hidden md:block">
          <TopBar />
        </div>

        {/* Mobile-only compact header, replaces sidebar + top bar on small screens */}
        <div className="flex items-center justify-between border-b border-ink/5 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setNavItem("instructions")}
            aria-label="Close assessment"
            className="text-ink/50 hover:text-ink"
          >
            <X size={20} />
          </button>
          <span className="text-base font-bold text-ink">QEval</span>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full w-full bg-gradient-to-br from-brand-400 to-brand-600" />
          </div>
        </div>

        {!sessionId && (navItem === "instructions" || navItem === "assessment") && (
          <WelcomeScreen onStart={handleStart} starting={starting} error={startError} />
        )}

        {inProgress && navItem === "assessment" && (
          <QuestionScreen
            key={question!.id}
            question={question!}
            progress={progress!}
            onSubmitAnswer={handleSubmitAnswer}
            onSkip={handleSkip}
            onAdvance={handleAdvance}
          />
        )}

        {sessionId && status === "completed" && summary && navItem === "assessment" && (
          <ResultsDashboard summary={summary} />
        )}

        {navItem === "resources" && (
          <div className="px-8 py-10 text-ink/50">Resources are not part of the MVP yet.</div>
        )}
        {navItem === "notes" && (
          <div className="px-8 py-10 text-ink/50">Notes are not part of the MVP yet.</div>
        )}
        {navItem === "admin" && <AdminPanel />}
      </div>

      {showComplete && (
        <CompletionScreen summary={summary} onClose={() => setShowComplete(false)} />
      )}
    </div>
  );
}