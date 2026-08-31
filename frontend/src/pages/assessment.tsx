import { useState } from "react";
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
      // Previously this failed silently - the button would just reset with
      // no feedback. Surface it so mis-set env vars / CORS / backend errors
      // are visible on the page instead of only in the browser console.
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
      // Natural completion now hands off to the ResultsDashboard render
      // branch below (driven by `status === "completed"`) instead of the
      // CompletionScreen modal, so clear the question rather than opening it.
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

  // No longer gated on `status` - once we hit "completed" we still want the
  // dashboard branch below to take over, not have this expression punt us
  // back to a blank state before that branch gets a chance to render.
  const inProgress = Boolean(sessionId && question && progress);

  return (
    <div className="flex h-screen w-full bg-surface">
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

      <div className="flex flex-1 flex-col overflow-y-auto">
        <TopBar />

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