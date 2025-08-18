import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCopy, FaEdit, FaArrowLeft, FaTrash, FaPlus } from "react-icons/fa";
import EditContest from "../components/EditContest";
import ConfirmModal from "../components/DeleteContest"
import EditQuestionModal from "../components/EditQuestion";
import AddQuestionModal from "../components/AddQuestionModal";
import ContestOverviewSkeleton from "../components/skeleton/ContestOverviewSkeleton";

// Confirmation Modal Component


export default function ContestOverview() {
  const { id } = useParams();
  const { batchId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editContestToggle, setEditContestToggle] = useState(false);
  // New state
const [showEditQuestion, setShowEditQuestion] = useState(false);
const [editQuestionId, setEditQuestionId] = useState(null);

// Replace handler
const handleEditQuestion = (qid) => {
  setEditQuestionId(qid);
  setShowEditQuestion(true);
};


  // For delete confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  //server

   const server=`${import.meta.env.VITE_SERVER}`;


  
// state
const [showAddQuestion, setShowAddQuestion] = useState(false);

// in handleAddQuestion:
const handleAddQuestion = () => setShowAddQuestion(true);


  useEffect(() => {
    fetchContestInfo();
    fetchContestQuestions();
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
      const res = await fetch(
        `${server}/api/questions?contestId=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) setQuestions(data);
      else toast.error(data.message || "Failed to get questions");
    } catch {
      toast.error("Error fetching questions");
    } finally {
      setLoading(false);
    }
  }

  // Ask before deleting contest
  const askDeleteContest = () => {
    setDeleteTarget(id);
    setDeleteType("contest");
    setShowConfirm(true);
  };

  // Ask before deleting question
  const askDeleteQuestion = (qid) => {
    setDeleteTarget(qid);
    setDeleteType("question");
    setShowConfirm(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (deleteType === "contest") {
      try {
        const res = await fetch(
          `${server}/api/contests/${deleteTarget}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          toast.success("Contest deleted");
          navigate("/college-admin/manage-contests");
        } else {
          toast.error("Failed to delete contest");
        }
      } catch {
        toast.error("Error deleting contest");
      }
    } else if (deleteType === "question") {
      try {
        const res = await fetch(
          `${server}/api/questions/${deleteTarget}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          setQuestions((prev) =>
            prev.filter((q) => q._id !== deleteTarget)
          );
          toast.success("Question deleted");
        } else {
          toast.error("Failed to delete question");
        }
      } catch {
        toast.error("Error deleting question");
      }
    }
    setShowConfirm(false);
  };

  const handleEditContest = () => {
    setEditContestToggle(true);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(contest?.key || "");
    toast.info("Copied Contest Key!");
  };

  
if (loading || !contest) return <ContestOverviewSkeleton />;
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(`/manage-batches/${batchId}/manage-contest`)}
          className="flex items-center text-gray-500 hover:text-gray-800 transition text-sm font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Contests
        </button>
      </div>
      {/* Contest Details */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{contest.title}</h1>
          <p className="text-gray-600 mb-2">{contest.description}</p>
          <div className="flex gap-6 items-center mb-2 text-sm">
            <span>
              <strong>Start:</strong>{" "}
              {new Date(contest.startTime).toLocaleString()}
            </span>
            <span>
              <strong>End:</strong> {new Date(contest.endTime).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-wrap mt-3 gap-2">
            {contest.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-emerald-200 text-emerald-800 rounded px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleEditContest}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <FaEdit /> Edit Contest
          </button>
          <button
            onClick={askDeleteContest}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
          >
            <FaTrash /> Delete Contest
          </button>
        </div>
      </div>
      {/* Questions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Challenge Questions</h2>
          <button
            onClick={handleAddQuestion}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center gap-2"
          >
            <FaPlus /> Add Question
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {questions.length === 0 ? (
            <div className="col-span-full text-gray-400 text-center bg-white rounded-xl p-8">
              No questions added yet.
            </div>
          ) : (
            questions.map((q) => (
              <div
                key={q._id}
                className="bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{q.title}</h3>
                  <span className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-0.5 text-sm">
                    {q.difficulty || "Easy"}
                  </span>
                </div>
                <div className="text-sm text-gray-500 truncate mb-1">
                  {q.description?.slice(0, 90)}
                  {q.description?.length > 90 && "..."}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEditQuestion(q._id)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    onClick={() => askDeleteQuestion(q._id)}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Edit Contest Modal */}
      {editContestToggle && (
        <EditContest
          contestId={id}
          initialData={contest}
          onClose={() => setEditContestToggle(false)}
          onContestUpdated={fetchContestInfo} // refresh after updating
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
          onQuestionUpdated={(updatedQ) => {
            setQuestions((prev) =>
              prev.map((q) => (q._id === updatedQ._id ? updatedQ : q))
            );
          }}
        />
      )}
      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal
          message={`Are you sure you want to delete this ${deleteType}?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
