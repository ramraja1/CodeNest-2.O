import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ProblemSolveView from "../ProblemSolveView";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";

export default function ContestPage() {
  const { batchId, contestId } = useParams();
  const navigate = useNavigate();
  const server = import.meta.env.VITE_SERVER;
  const { token, userId } = useContext(UserContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialProblemIdFromUrl = searchParams.get("problemId");
  const [currentProblemId, setCurrentProblemId] = useState(initialProblemIdFromUrl);

  const [contestInfo, setContestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingContest, setLoadingContest] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState(null);

  // New states for user submissions and leaderboard
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingUserSubs, setLoadingUserSubs] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const timerRef = useRef();
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  // Fetch contest info
  useEffect(() => {
    async function fetchContest() {
      try {
        setLoadingContest(true);
        const res = await fetch(`${server}/api/contests/${contestId}?batchId=${batchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch contest info");
        const data = await res.json();
        setContestInfo(data);
      } catch (err) {
        setError(err.message || "Error fetching contest info");
      } finally {
        setLoadingContest(false);
      }
    }
    fetchContest();
  }, [batchId, contestId, server, token]);

  // Fetch questions once contest info ready
  useEffect(() => {
    if (!contestInfo) return;
    async function fetchQuestions() {
      try {
        setLoadingQuestions(true);
        const res = await fetch(`${server}/api/questions?contestId=${contestId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.message || "Error fetching questions");
      } finally {
        setLoadingQuestions(false);
      }
    }
    fetchQuestions();
  }, [contestId, contestInfo, server, token]);

  // Fetch user submissions for this contest
  useEffect(() => {
    if (!userId || !contestId) return;
    async function fetchUserSubs() {
      try {
        setLoadingUserSubs(true);
        const res = await fetch(`${server}/api/submissions?userId=${userId}&contestId=${contestId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user submissions");
        const data = await res.json();
        console.log(data);
        setUserSubmissions(data.submissions || []);
      } catch (err) {
        console.error("Error fetching user submissions:", err);
      } finally {
        setLoadingUserSubs(false);
      }
    }
    fetchUserSubs();
  }, [userId, contestId, token, server]);

  // Fetch top 3 leaderboard users for contest
  useEffect(() => {
    if (!contestId) return;
    async function fetchLeaderboard() {
      try {
        setLoadingLeaderboard(true);
        const res = await fetch(`${server}/api/contests/${contestId}/leaderboard?top=3`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoadingLeaderboard(false);
      }
    }
    fetchLeaderboard();
  }, [contestId, token, server]);

  // Timer countdown
  useEffect(() => {
    if (!contestInfo) return;
    function updateTimer() {
      const now = new Date();
      const end = new Date(contestInfo.endTime);
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(timerRef.current);
      } else {
        const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
        setTimeLeft(`${h}:${m}:${s}`);
      }
    }
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [contestInfo]);

  // Sync currentProblemId with URL param changes
  useEffect(() => {
    if (initialProblemIdFromUrl !== currentProblemId) {
      setCurrentProblemId(initialProblemIdFromUrl);
    }
  }, [initialProblemIdFromUrl]);

  // Helper function to get user’s submission status for a problem
  function getProblemStatus(problemId) {
    const sub = userSubmissions.find((s) => s.problemId === problemId);
    if (!sub) return "notAttempted";
    return sub.score > 0 ? "solved" : "attempted";
  }

  // Calculate total user contest score
  const totalContestScore = userSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);

  if (loadingContest)
    return <div className="flex items-center justify-center h-full p-10">Loading contest details...</div>;
  if (error)
    return <div className="text-red-600 font-semibold flex items-center justify-center h-full p-10">{error}</div>;

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
    <div className="w-full min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#f0fdfa] to-[#fff] p-0 m-0">
      {/* Header */}
      <header className="flex justify-between items-center bg-white/70 backdrop-blur-md shadow-md px-8 py-6 sticky top-0 z-10">
        <button
          className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded hover:bg-emerald-300"
          onClick={() => navigate(`/student/batch/${batchId}/contests`)}
        >
          ← Back to Batch
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-emerald-800 drop-shadow">
            🔥 {contestInfo?.title}
          </h2>
          <span className="text-lg text-gray-700 font-semibold mt-1">
            {timeLeft !== "00:00:00" ? "Live Now" : "Contest Ended"}
          </span>
        </div>
        <div className="bg-white/90 px-6 py-2 rounded-2xl font-mono text-lg text-emerald-600 shadow border border-emerald-200 animate-pulse">
          ⏳ {timeLeft} left
        </div>
      </header>

      {/* Contest Description */}
      <div className="max-w-2xl mx-auto mt-8 px-6 py-4 bg-white/70 backdrop-blur rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="text-emerald-900 font-bold">{contestInfo?.description}</div>
          <div className="text-xs text-gray-500 mt-1">
            Prizes: <span className="font-semibold text-amber-600">{contestInfo?.prizes}</span>
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-2 md:mt-0">
          Ends on: <span className="font-medium">{new Date(contestInfo?.endTime).toLocaleString()}</span>
        </div>
      </div>

      {/* Problems List Grid */}
      <div className="max-w-3xl mx-auto py-10 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loadingQuestions ? (
          <div className="text-center text-gray-500 col-span-full">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="text-center col-span-full text-gray-500">No questions found for this contest.</div>
        ) : (
          questions.map((q, i) => {
            const status = getProblemStatus(q._id);
            const baseClasses =
              "transition-transform hover:scale-105 duration-150 rounded-xl p-5 flex flex-col items-start cursor-pointer shadow-lg";
            const colorClasses =
              status === "solved"
                ? "bg-emerald-100 border-emerald-500 text-emerald-900 border-l-8"
                : status === "attempted"
                ? "bg-yellow-100 border-yellow-400 text-yellow-800 border-l-8"
                : "bg-white border-gray-300 text-gray-700 border-l-4";

            return (
              <div
                key={q._id}
                className={`${baseClasses} ${colorClasses}`}
                onClick={() => {
                  setCurrentProblemId(q._id);
                  setSearchParams({ problemId: q._id });
                }}
              >
                <span className="text-sm mb-1 opacity-75">Q{i + 1}</span>
                <div className="text-lg font-bold mb-2">{q.title}</div>
                <div
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    status === "solved"
                      ? "bg-emerald-300 text-emerald-900"
                      : status === "attempted"
                      ? "bg-yellow-300 text-yellow-900"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {status === "solved"
                    ? "Solved"
                    : status === "attempted"
                    ? "Attempted"
                    : "Unattempted"}
                </div>

                <button
                  type="button"
                  className="mt-4 ml-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full drop-shadow"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentProblemId(q._id);
                    setSearchParams({ problemId: q._id });
                  }}
                >
                  Start Coding 🚀
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Leaderboard Preview */}
      <div className="max-w-3xl mx-auto mt-10 py-5 px-6 bg-white/70 rounded-xl shadow border border-emerald-100">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <div>
            <span className="font-semibold text-emerald-900">Leaderboard Preview</span>
            <span className="ml-2 text-gray-400 text-xs">(Top 3)</span>
          </div>
          <button
            className="text-emerald-700 hover:underline text-sm"
            onClick={() => navigate(`/student/batch/${batchId}/contests/${contestId}/leaderboard`)}
          >
            View Full Leaderboard →
          </button>
        </div>
        {loadingLeaderboard ? (
          <div className="text-center text-gray-500">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-gray-500">No leaderboard data available.</div>
        ) : (
          <ol className="space-y-3">
            {leaderboard.map((entry, idx) => (
              <li
                key={entry._id}
                className={`flex justify-between items-center px-4 py-2 rounded ${
                  entry._id === userId ? "bg-emerald-100 font-semibold" : "bg-white"
                } shadow-sm`}
              >
                <span>
                  #{idx + 1} {entry.username || "User"}
                </span>
                <span className="font-semibold text-emerald-700">{entry.totalScore}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
