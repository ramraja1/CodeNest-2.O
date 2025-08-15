import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import CreateContest from "../components/CreateContest";

export default function CollegeAdminContestDashboard() {
  const { batchId } = useParams();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createToggle, setCreateToggle] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  //serve from env
   const server=`${import.meta.env.VITE_SERVER}`;
  // Fetch only contests linked to this batch
  const fetchContests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${server}/api/contests?batchId=${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setContests(data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
      } else {
        setError(data.message || "Failed to load contests");
      }
    } catch {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
    // eslint-disable-next-line
  }, [token, batchId]);

  const handleCreatetoggle = () => setCreateToggle(false);
  const handleCreate = () => setCreateToggle(true);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading contests...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(`/manage-batches/${batchId}`)}
          className="flex items-center text-gray-500 hover:text-gray-800 transition text-sm font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Your Batch
        </button>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold mb-10 text-gray-800">Manage Contests (Batch: {batchId})</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Add Contest Card */}
        <div
          onClick={handleCreate}
          className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-dashed border-emerald-400 hover:bg-emerald-50 cursor-pointer transition hover:shadow-lg min-h-[220px]"
        >
          <FaPlus className="text-emerald-500 text-4xl mb-3" />
          <p className="font-semibold text-emerald-600 text-lg">Add Contest</p>
        </div>

        {/* Contest Cards */}
        {contests.length === 0 ? (
          <p className="col-span-full text-gray-500">No contests created yet for this batch.</p>
        ) : (
          contests.map((contest) => (
            <div
              key={contest._id}
              onClick={() => navigate(`/manage-batches/${batchId}/contest/${contest._id}`)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-transform duration-200 p-6 flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                  {contest.title}
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  Start Time : {new Date(contest.startTime).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  End Time : {new Date(contest.endTime).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {contest.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Contest Modal */}
      {createToggle && (
        <CreateContest
          batchId={batchId}
          handleCreatetoggle={handleCreatetoggle}
          onContestCreated={fetchContests}
        />
      )}
    </div>
  );
}
