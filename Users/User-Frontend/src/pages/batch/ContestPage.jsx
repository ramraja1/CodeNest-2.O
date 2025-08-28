import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import ProblemSolveView from "../ProblemSolveView";
import { toast } from "react-toastify";
import classNames from "classnames";

export default function ContestPage() {
  const { batchId, contestId } = useParams();
  const navigate = useNavigate();
  const server = import.meta.env.VITE_SERVER;
  const { token, userId } = React.useContext(UserContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialProblemIdFromUrl = searchParams.get("problemId");
  const [currentProblemId, setCurrentProblemId] = useState(initialProblemIdFromUrl);

  const [contestInfo, setContestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [loadingContest, setLoadingContest] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingUserSubs, setLoadingUserSubs] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const [error, setError] = useState(null);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const timerRef = useRef();
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  // Fetch contest info
  useEffect(() => {
    if (!contestId) return;
    setError(null);
    setLoadingContest(true);

    fetch(`${server}/api/contests/${contestId}?batchId=${batchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch contest info");
        return await res.json();
      })
      .then((data) => setContestInfo(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingContest(false));
  }, [batchId, contestId, server, token]);

  // Fetch questions
  useEffect(() => {
    if (!contestInfo) return;
    setLoadingQuestions(true);

    fetch(`${server}/api/questions?contestId=${contestId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return await res.json();
      })
      .then((data) => setQuestions(data.questions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingQuestions(false));
  }, [contestInfo, contestId, server, token]);

  // Fetch user submissions
  useEffect(() => {
    if (!userId || !contestId) return;
    setLoadingUserSubs(true);

    fetch(`${server}/api/submissions?userId=${userId}&contestId=${contestId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch user submissions");
        return await res.json();
      })
      .then((data) => setUserSubmissions(data.submissions || []))
      .catch(() => toast.error("Failed to load your submissions"))
      .finally(() => setLoadingUserSubs(false));
  }, [userId, contestId, server, token]);

  // Fetch leaderboard
  useEffect(() => {
    if (!contestId) return;
    setLoadingLeaderboard(true);

    fetch(`${server}/api/contests/${contestId}/leaderboard?top=5`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return await res.json();
      })
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => toast.error("Failed to load leaderboard"))
      .finally(() => setLoadingLeaderboard(false));
  }, [contestId, server, token]);

  // Timer countdown
  useEffect(() => {
    if (!contestInfo || !contestInfo.endTime) return;
    const endTime = new Date(contestInfo.endTime);

    function updateTimer() {
      const diff = endTime - new Date();

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(timerRef.current);
        return;
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    }
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [contestInfo]);

  // Sync currentProblemId with URL
  useEffect(() => {
    if (initialProblemIdFromUrl !== currentProblemId) {
      setCurrentProblemId(initialProblemIdFromUrl);
    }
  }, [initialProblemIdFromUrl, currentProblemId]);

  // Get problem status
  const getProblemStatus = useCallback(
    (problemId) => {
      const submission = userSubmissions.find((s) => s.problemId === problemId);
      if (!submission) return "notAttempted";
      return submission.score > 0 ? "solved" : "attempted";
    },
    [userSubmissions]
  );

  // Total score calculation
  const totalContestScore = userSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);

  // Handler to end contest
  const handleEndContest = async () => {
 

    try {
      const res = await fetch(`${server}/api/contests/${contestId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to end contest");
      toast.success("Contest ended successfully");
      setConfirmEndOpen(false);
      navigate(`/student/batch/${batchId}/contests`);  // Redirect user to batch
      // Optionally refetch contest data or navigate away
    } catch {
      toast.error("Error ending contest");
    }
  };

  // Loading/Error UI
  if (loadingContest)
    return <CenteredMessage message="Loading contest details..." />;
  if (error)
    return <CenteredMessage message={error} isError />;

  // Problem solve view
  if (currentProblemId) {
    return (
      <ProblemSolveView
        questions={questions}
        initialProblemId={currentProblemId}
        onBack={() => {
          setCurrentProblemId(null);
          setSearchParams({});
        }}
        userId={userId}
        token={token}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 text-gray-900 font-sans select-none max-w-7xl mx-auto">
  {/* Header */}
  <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <button
      onClick={() => navigate(`/student/batch/${batchId}/contests`)}
      className="text-sm font-semibold px-4 py-2 border rounded border-gray-300 hover:bg-gray-200 transition"
    >
      ← Back to Batch
    </button>
    <div className="flex flex-col sm:items-center gap-1">
      <h1 className="text-3xl font-bold text-gray-800">{contestInfo?.title}</h1>
      <p className={classNames(
           "text-sm font-semibold", 
           timeLeft === "00:00:00" ? "text-red-600" : "text-green-700"
      )}>
        {timeLeft === "00:00:00" ? "Contest Ended" : `Live — ${timeLeft} left`}
      </p>
    </div>
    <button
      onClick={() => setConfirmEndOpen(true)}
      className="self-start sm:self-auto px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 shadow"
    >
      End Contest
    </button>
  </header>

  {/* Description */}
  <section className="mb-8 bg-white rounded-lg p-6 border border-gray-200">
    <p className="text-gray-700 mb-2">{contestInfo?.description || "No contest description."}</p>
    <p className="text-sm text-gray-500">
      <strong>Prizes:</strong>{" "}
      <span className="text-yellow-600 font-semibold">{contestInfo?.prizes || "TBD"}</span>
    </p>
    <p className="mt-1 text-xs text-gray-400">
      Ends on: {new Date(contestInfo?.endTime).toLocaleString()}
    </p>
  </section>

  {/* Main 2-column Layout */}
  <div className="flex gap-8">
    {/* Problems List, scrollable */}
    <section className="flex-1 overflow-y-auto max-h-[70vh] pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loadingQuestions ? (
          <CenteredMessage message="Loading questions..." />
        ) : questions.length === 0 ? (
          <CenteredMessage message="No questions found." />
        ) : (
          questions.map((q, i) => (
            <QuestionCard
              key={q._id}
              question={q}
              index={i}
              status={getProblemStatus(q._id)}
              onSelect={() => {
                setCurrentProblemId(q._id);
                setSearchParams({ problemId: q._id });
              }}
            />
          ))
        )}
      </div>
    </section>

    {/* Leaderboard - sticky on right */}
    <aside className="w-full max-w-xs hidden lg:block">
      <div className="sticky top-24">
        <section className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-gray-800">Leaderboard Preview</h2>
            <button
              onClick={() => navigate(`/student/batch/${batchId}/contests/${contestId}/leaderboard`)}
              className="text-indigo-600 hover:underline text-sm font-medium"
            >
              View Full →
            </button>
          </div>
          {loadingLeaderboard ? (
            <CenteredMessage message="Loading leaderboard..." />
          ) : leaderboard.length === 0 ? (
            <CenteredMessage message="No leaderboard data available." />
          ) : (
            <ol className="divide-y divide-gray-200">
              {leaderboard.map((entry, idx) => (
                <li
                  key={entry._id}
                  className={classNames(
                    "flex justify-between py-2",
                    entry._id === userId ? "bg-indigo-100 font-semibold rounded px-2" : ""
                  )}
                >
                  <span>#{idx + 1} {entry.username || "User"}</span>
                  <span className="text-indigo-700 font-semibold">{entry.totalScore}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </aside>
  </div>

  {/* Confirmation Modal, etc. */}
  {confirmEndOpen && (
    <ConfirmationModal
      title="End Contest"
      message="Are you sure you want to end this contest? This action cannot be undone."
      onConfirm={handleEndContest}
      onCancel={() => setConfirmEndOpen(false)}
    />
  )}
</main>

  );
}

// Centered message component
const CenteredMessage = ({ message, isError = false }) => (
  <div className={classNames("text-center text-gray-500 py-20", { "text-red-600": isError })}>
    {message}
  </div>
);


// Question card component
const QuestionCard = ({ question, index, status, onSelect }) => {
  const colors = {
    solved: "bg-green-100 border-green-500 text-green-800",
    attempted: "bg-yellow-100 border-yellow-400 text-yellow-800",
    notAttempted: "bg-white border-gray-300 text-gray-700",
  };
  const statusText = {
    solved: "Solved",
    attempted: "Attempted",
    notAttempted: "Unattempted",
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      className={classNames(
        "rounded-lg border p-5 flex flex-col cursor-pointer transition hover:scale-[1.03] duration-200",
        colors[status]
      )}
      aria-pressed="false"
      aria-label={`Question ${index + 1}: ${question.title}, status ${statusText[status]}`}
    >
      <span className="font-semibold opacity-70 mb-1 select-none">Q{index + 1}</span>
      <h3 className="font-bold mb-2 truncate">{question.title}</h3>
      <span className="text-xs font-semibold px-2 py-1 rounded select-none bg-opacity-60 self-start">
        {statusText[status]}
      </span>
      <button
        type="button"
        className="mt-auto self-end rounded-full bg-indigo-600 text-white px-4 py-1 font-semibold hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 mt-4"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        Start
      </button>
    </div>
  );
};

// Simple reusable confirmation modal
const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
