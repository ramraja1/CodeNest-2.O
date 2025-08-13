import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function CollegeAdminContestDashboard() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchContests() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:5000/api/contests", {
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
    }
    fetchContests();
  }, [token]);

  const handleCreate = () => navigate("/create-contest");
  const handleEdit = (id) => navigate(`/college-admin/edit-contest/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contest?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/contests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setContests((prev) => prev.filter((contest) => contest._id !== id));
        toast.success("Contest deleted");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete contest");
      }
    } catch {
      toast.error("Error connecting to server");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading contests...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Back button */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate("/college-dashboard")}
          className="flex items-center text-gray-500 hover:text-gray-800 transition text-sm font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Home
        </button>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold mb-10 text-gray-800">Manage Contests</h1>

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
          <p className="col-span-full text-gray-500">No contests created yet.</p>
        ) : (
          contests.map((contest) => (
            <div
              key={contest._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-transform duration-200 p-6 flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                  {contest.title}
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  {new Date(contest.startTime).toLocaleString()} ―{" "}
                  {new Date(contest.endTime).toLocaleString()}
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
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={() => handleEdit(contest._id)}
                  className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(contest._id)}
                  className="flex items-center gap-1 text-red-600 hover:underline text-sm font-medium"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
