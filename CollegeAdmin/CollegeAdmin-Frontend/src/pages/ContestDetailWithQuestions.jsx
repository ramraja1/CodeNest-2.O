/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCopy,
  FaEdit,
  FaArrowLeft,
  FaTrash,
  FaPlus,
  FaSyncAlt,
  FaFilePdf,
  FaInfoCircle,
} from "react-icons/fa";

import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

import EditContest from "../components/EditContest";
import ConfirmModal from "../components/DeleteContest";
import EditQuestionModal from "../components/EditQuestion";
import AddQuestionModal from "../components/AddQuestionModal";
import ContestOverviewSkeleton from "../components/skeleton/ContestOverviewSkeleton";
import { ChatBotModal } from "../components/ChatBotModal";

import RobotAssistant from "../components/RobotAssistant";
// ───────────────────────────────
// Reusable UI Components
// ───────────────────────────────

function ActionButton({ onClick, children, className = "", ...props }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner">
      <FaInfoCircle
        className="text-emerald-500 mb-5 text-4xl"
        aria-hidden="true"
      />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">{subtitle}</p>
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}

function Tag({ label }) {
  return (
    <span className="inline-block bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-medium px-3 py-1 rounded-full select-none">
      {label}
    </span>
  );
}

// ───────────────────────────────
// Contest Info Card
// ───────────────────────────────
function ContestInfoCard({ contest, onEdit, onDelete }) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 flex flex-col md:flex-row justify-between gap-8 md:items-center">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">
          {contest.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
          {contest.description}
        </p>

        <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm text-gray-700 dark:text-gray-400 mt-4 font-medium select-none">
          <div>
            <span className="font-semibold">Start:</span>{" "}
            <time dateTime={contest.startTime}>
              {new Date(contest.startTime).toLocaleString()}
            </time>
          </div>
          <div>
            <span className="font-semibold">End:</span>{" "}
            <time dateTime={contest.endTime}>
              {new Date(contest.endTime).toLocaleString()}
            </time>
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2 mt-4"
          aria-label="Contest Tags"
        >
          {contest.tags.map((tag, idx) => (
            <Tag key={idx} label={tag} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 shrink-0">
        <ActionButton
          onClick={onEdit}
          className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
        >
          <FaEdit aria-hidden="true" /> Edit
        </ActionButton>
        <ActionButton
          onClick={onDelete}
          className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
        >
          <FaTrash aria-hidden="true" /> Delete
        </ActionButton>
      </div>
    </article>
  );
}

// ───────────────────────────────
// Question Card
// ───────────────────────────────
function QuestionCard({ question, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-150">
      <header className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 truncate">
          {question.title}
        </h3>
        <span className="text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 rounded-full px-3 py-1 select-none">
          {question.difficulty ?? "Easy"}
        </span>
      </header>

      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
        {question.description || "No description provided."}
      </p>

      <div className="flex gap-4 mt-3">
        <button
          type="button"
          onClick={() => onEdit(question._id)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold flex items-center gap-2 transition-colors text-sm"
          aria-label={`Edit question ${question.title}`}
        >
          <FaEdit /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(question._id)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 font-semibold flex items-center gap-2 transition-colors text-sm"
          aria-label={`Delete question ${question.title}`}
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────
// Leaderboard Table
// ───────────────────────────────
function LeaderboardTable({ leaderboard }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <EmptyState
        title="No Leaderboard Records"
        subtitle="Students haven't attempted this contest yet. Once participants start solving, you'll see scores here."
      />
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-900 overflow-y-auto max-h-[55vh]">
      <table className="w-full text-sm table-auto">
        <thead className="sticky top-0 bg-emerald-50 dark:bg-emerald-900/20 z-10">
          <tr>
            <th className="py-3 px-4 text-left font-semibold text-emerald-700 dark:text-emerald-300 w-16 sticky">
              Rank
            </th>
            <th className="py-3 px-4 text-left font-semibold text-emerald-700 dark:text-emerald-300 min-w-[150px]">
              Participant
            </th>
            <th className="py-3 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-300 w-24">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, idx) => {
            let bg = "";
            let borderLeft = "";
            if (idx === 0) {
              bg = "bg-yellow-100 dark:bg-yellow-900/30";
              borderLeft = "border-l-4 border-yellow-400";
            } else if (idx === 1) {
              bg = "bg-slate-100 dark:bg-slate-800/40";
              borderLeft = "border-l-4 border-slate-400";
            } else if (idx === 2) {
              bg = "bg-orange-100 dark:bg-orange-900/30";
              borderLeft = "border-l-4 border-orange-400";
            }

            return (
              <tr
                key={entry._id || idx}
                className={`${bg} hover:bg-emerald-50/70 dark:hover:bg-emerald-900/50 transition cursor-pointer ${borderLeft}`}
                title={`${entry.username || entry.name || "Unknown"} — Score: ${
                  entry.totalScore ?? entry.score ?? "-"
                }`}
              >
                <td className="py-2 px-4 font-bold text-lg whitespace-nowrap">
                  {idx === 0 ? (
                    <span>🥇</span>
                  ) : idx === 1 ? (
                    <span>🥈</span>
                  ) : idx === 2 ? (
                    <span>🥉</span>
                  ) : null}
                  <span className="ml-1">{entry.rank ?? idx + 1}</span>
                </td>
                <td className="py-2 px-4 font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px] flex items-center gap-2">
                  {/* Placeholder for Avatar: Replace with actual image if available */}
                  <span>{entry.username || entry.name || "Unknown"}</span>
                </td>
                <td className="py-2 px-4 text-right text-emerald-700 dark:text-emerald-300 font-bold text-base whitespace-nowrap">
                  {entry.totalScore ?? entry.score ?? "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ───────────────────────────────
// Main Contest Overview Component
// ───────────────────────────────
export default function ContestOverview() {
  const { id, batchId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [showChatbotModal,setShowChatbotModal]=useState(false);
  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const isSuccess =()=>{
    fetchContestQuestions();
  }
  // Modals state

  const [editContestToggle, setEditContestToggle] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  const server = import.meta.env.VITE_SERVER;

  // Load data
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchContestInfo(), fetchContestQuestions(), fetchLeaderboard()]).finally(() => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchContestInfo() {
    try {
      const res = await fetch(`${server}/api/contests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setContest(data);
      else toast.error(data.message || "Failed to get contest");
    } catch {
      toast.error("Error fetching contest");
    }
  }

  async function fetchContestQuestions() {
    try {
      const res = await fetch(`${server}/api/questions?contestId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setQuestions(data);
      else toast.error(data.message || "Failed to get questions");
    } catch {
      toast.error("Error fetching questions");
    }
  }

  async function fetchLeaderboard() {
    try {
      const res = await fetch(`${server}/api/contests/${id}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setLeaderboard(data.leaderboard || data);
      else toast.error(data.message || "Failed to get leaderboard");
    } catch {
      toast.error("Error fetching leaderboard");
    }
  }

  // Delete handlers
  const askDelete = (type, id) => {
    setDeleteTarget(id);
    setDeleteType(type);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    let url = "";
    if (deleteType === "contest") url = `${server}/api/contests/${deleteTarget}`;
    else if (deleteType === "question") url = `${server}/api/questions/${deleteTarget}`;

    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (deleteType === "question") {
          setQuestions((prev) => prev.filter((q) => q._id !== deleteTarget));
          toast.success("Question deleted");
        } else {
          toast.success("Contest deleted");
          navigate(`/manage-batches/${batchId}`);
        }
      } else toast.error("Failed to delete");
    } catch {
      toast.error("Error deleting");
    }
    setShowConfirm(false);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(contest?.key || "");
    toast.success("Copied Contest Key!");
  };

  // Refresh handler for leaderboard reload
  // const refreshLeaderboard = async () => {
  //   setLoading(true);
  //   await fetchLeaderboard();
  //   setLoading(false);
  // };

  // Download leaderboard as PDF using updated autoTable usage
  const downloadLeaderboardPDF = () => {
    if (!leaderboard.length) {
      toast.info("Leaderboard is empty!");
      return;
    }

    try {
      const doc = new jsPDF();

      const columns = ["Rank", "Participant", "Score"];

      const rows = leaderboard.map((entry, idx) => [
        entry.rank ?? idx + 1,
        entry.username || entry.name || "Unknown",
        entry.totalScore ?? entry.score ?? "-",
      ]);

      autoTable(doc, {
        head: [columns],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] }, // emerald green
        styles: { fontSize: 10, cellPadding: 6 },
        margin: { top: 20 },
      });

      doc.save(`leaderboard_contest_${id}.pdf`);
    } catch (error) {
      toast.error("Error generating PDF: " + error.message);
      console.error(error);
    }
  };

  if (loading || !contest) return <ContestOverviewSkeleton />;

  return (
    <main className="max-w-7xl mx-auto py-10 px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 dark:bg-gray-950 min-h-screen">
      {/* Left Side: Contest info and Questions */}
      <section className="lg:col-span-2 flex flex-col gap-10">
        <button
          onClick={() => navigate(`/manage-batches/${batchId}/manage-contest`)}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-semibold mb-2 transition-colors"
          aria-label="Back to Contests"
        >
          <FaArrowLeft /> Back to Contests
        </button>

        <ContestInfoCard
          contest={contest}
          onEdit={() => setEditContestToggle(true)}
          onDelete={() => askDelete("contest", id)}
        />

        <article className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
         <header className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
    Challenge Questions
  </h2>
  <div className="flex gap-2">
    <ActionButton
      onClick={() => setShowAddQuestion(true)}
      className="bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
      title="Add a new question manually"
    >
      <FaPlus className="mr-2" /> Add Question
    </ActionButton>
    <ActionButton
      onClick={() => setShowChatbotModal(true)} // Open the ChatBot modal
      className="bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
      title="Let AI generate questions for you"
    >
      <span className="mr-2">🤖</span>Add with AI
    </ActionButton>
  </div>
</header>


          {questions.length === 0 ? (
            <EmptyState
              title="No Questions Yet"
              subtitle="Start by creating your first question for this contest."
              action={
                <ActionButton
                  onClick={() => setShowAddQuestion(true)}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 mt-4"
                >
                  <FaPlus /> Add Question
                </ActionButton>
              }
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {questions.map((q) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  onEdit={(id) => {
                    setEditQuestionId(id);
                    setShowEditQuestion(true);
                  }}
                  onDelete={(id) => askDelete("question", id)}
                />
              ))}
            </div>
          )}
        </article>
      </section>

      {/* Right Side: Leaderboard */}
      <aside className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col h-fit">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Leaderboard
          </h2>
          <div className="flex gap-3">
            <button
              onClick={()=>{fetchLeaderboard()}}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white font-semibold text-sm shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition"
              aria-label="Refresh Leaderboard"
              title="Refresh Leaderboard"
            >
              <FaSyncAlt />
              
            </button>
            <button
              onClick={downloadLeaderboardPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition"
              aria-label="Download Leaderboard as PDF"
              title="Download Leaderboard as PDF"
            >
              <FaFilePdf />
              PDF
            </button>
          </div>
        </div>

        <LeaderboardTable leaderboard={leaderboard} />
      </aside>

      {/* Modals */}
      {editContestToggle && (
        <EditContest
          contestId={id}
          initialData={contest}
          onClose={() => setEditContestToggle(false)}
          onContestUpdated={fetchContestInfo}
        />
      )}
      {showAddQuestion && (
        <AddQuestionModal
          contestId={id}
          token={token}
          onClose={() => setShowAddQuestion(false)}
          onQuestionAdded={(newQ) => setQuestions((prev) => [...prev, newQ])}
        />
      )}
      {showEditQuestion && (
        <EditQuestionModal
          questionId={editQuestionId}
          token={token}
          onClose={() => setShowEditQuestion(false)}
          onQuestionUpdated={(updatedQ) =>
            setQuestions((prev) =>
              prev.map((q) => (q._id === updatedQ._id ? updatedQ : q))
            )
          }
        />
      )}
      {showConfirm && (
        <ConfirmModal
          message={`Are you sure you want to delete this ${deleteType}?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showChatbotModal && (
  <ChatBotModal
    onClose={() => setShowChatbotModal(false)}
    contestID={id}
    addSuccess={isSuccess}
  />
)}

 <RobotAssistant onClick={() => setShowBot(true)} size={80} />
    </main>
  );
}
