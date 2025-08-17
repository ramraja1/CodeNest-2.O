import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ProblemSolveView from "../ProblemSolveView";

export default function ContestPage() {
  const { batchId, contestId } = useParams();
  const navigate = useNavigate();
  const server = import.meta.env.VITE_SERVER;
  const token = localStorage.getItem("token");

  // Read and set current problem ID from URL query parameter
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProblemIdFromUrl = searchParams.get("problemId");
  const [currentProblemId, setCurrentProblemId] = useState(initialProblemIdFromUrl);

  // Contest info and questions state
  const [contestInfo, setContestInfo] = useState(null); // title, desc, time, prizes, etc
  const [questions, setQuestions] = useState([]);
  const [loadingContest, setLoadingContest] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const timerRef = useRef();

  // Fetch Contest Info
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

  // Fetch questions after contest info is fetched
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

  // Timer logic: update every second
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

  // Sync state currentProblemId with URL param if it changes externally
  useEffect(() => {
    if (initialProblemIdFromUrl !== currentProblemId) {
      setCurrentProblemId(initialProblemIdFromUrl);
    }
  }, [initialProblemIdFromUrl]);

  // Loading and error states
  if (loadingContest)
    return <div className="flex items-center justify-center h-full p-10">Loading contest details...</div>;
  if (error)
    return (
      <div className="text-red-600 font-semibold flex items-center justify-center h-full p-10">{error}</div>
    );

  // If a problem is selected, render only ProblemSolveView to avoid UI conflicts
  if (currentProblemId) {
    return (
      <ProblemSolveView
        questions={questions}
        initialProblemId={currentProblemId}
        onBack={() => {
          setCurrentProblemId(null);
          setSearchParams({});
        }}
      />
    );
  }

  // Render contest overview page
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
        {/* Contest Timer */}
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
      <div className="max-w-3xl mx-auto py-10">
        {loadingQuestions ? (
          <div className="text-center text-gray-500">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="text-center col-span-full text-gray-500">No questions found for this contest.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {questions.map((q, i) => (
              <div
                key={q._id}
                className={`transition-transform hover:scale-105 duration-150 bg-white/80 shadow-lg rounded-xl p-5 flex flex-col items-start border-l-4 ${
                  q.status === "correct"
                    ? "border-emerald-500"
                    : q.status === "attempted"
                    ? "border-yellow-400"
                    : "border-gray-300"
                }`}
              >
                <span className="text-sm text-gray-500 mb-1">Q{i + 1}</span>
                <div className="text-lg font-bold text-emerald-900 mb-2">{q.title}</div>
                <div
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    q.status === "correct"
                      ? "bg-emerald-100 text-emerald-700"
                      : q.status === "attempted"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {q.status?.charAt(0).toUpperCase() + q.status?.slice(1) || "Unknown"}
                </div>
                <button
                  type="button"
                  className="mt-4 ml-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full drop-shadow"
                  onClick={() => {
                    setCurrentProblemId(q._id);
                    setSearchParams({ problemId: q._id });
                  }}
                >
                  Start Coding 🚀
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard Preview */}
      <div className="max-w-3xl mx-auto mt-10 py-5 px-6 bg-white/70 rounded-xl shadow border border-emerald-100">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div>
            <span className="font-semibold text-emerald-900">Leaderboard Preview</span>
            <span className="ml-2 text-gray-400 text-xs">(Top 3)</span>
          </div>
          <button className="text-emerald-700 hover:underline text-sm">View Full Leaderboard →</button>
        </div>
        {/* TODO: Insert top 3 students here */}
      </div>
    </div>
  );
}
