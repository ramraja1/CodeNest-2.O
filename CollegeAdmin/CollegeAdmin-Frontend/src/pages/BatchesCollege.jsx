import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaPlus,
  FaUsers,
  FaLayerGroup,
  FaTasks,
} from "react-icons/fa";
import AddBatchModal from "../components/AddBatchModel";
import BatchSkeleton from "../components/skeleton/BatchSkeleton";

export default function ManageBatchesDashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addToggle, setAddToggle] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleAddBatches = () => setAddToggle(false);
  const server = `${import.meta.env.VITE_SERVER}`;

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${server}/api/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBatches(data);
      } else {
        toast.error(data.message || "Failed to load batches");
      }
    } catch {
      toast.error("Server error loading batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 sm:px-6">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/college-dashboard")}
          className="flex items-center text-gray-600 hover:text-emerald-600 transition font-medium text-sm"
          aria-label="Back to Home"
        >
          <FaArrowLeft className="mr-2 text-lg" /> Back to Home
        </button>
      </div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-2">
            <FaLayerGroup className="text-emerald-600 text-2xl" />
            Manage Batches
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Create and manage student batches for your college.
          </p>
        </div>
        <button
          onClick={() => setAddToggle(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md shadow text-sm font-semibold transition-transform transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
        >
          <FaPlus className="text-sm" /> Add Batch
        </button>
      </header>

      {/* Batch Grid */}
      {loading ? (
        <BatchSkeleton />
      ) : batches.length === 0 ? (
        <div className="text-center text-gray-400 bg-white p-12 rounded-lg shadow max-w-lg mx-auto">
          No batches created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          {batches.map((batch) => (
            <div
              key={batch._id}
              onClick={() =>
                navigate(`/manage-batches/${batch._id}`, {
                  state: {
                    totalStudents: batch.totalStudents,
                    totalContests: batch.totalContests,
                    batchCode: batch.batchCode,
                  },
                })
              }
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter")
                  navigate(`/manage-batches/${batch._id}`, {
                    state: {
                      totalStudents: batch.totalStudents,
                      totalContests: batch.totalContests,
                      batchCode: batch.batchCode,
                    },
                  });
              }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-transform duration-200 cursor-pointer flex flex-col justify-between focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            >
              <div className="p-7 flex-1 flex flex-col">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 truncate">
                  {batch.name}
                </h2>
                <p className="text-xs text-gray-600 line-clamp-3 flex-grow">
                  {batch.description || "No description provided"}
                </p>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-gray-600 text-xs font-medium select-none rounded-b-lg">
                <div className="flex items-center gap-1">
                  <FaUsers className="text-emerald-500 text-base" />
                  <span>{batch.totalStudents || 0} Students</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaTasks className="text-emerald-600 text-base" />
                  <span>{batch.totalContests || 0} Contests</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addToggle && (
        <AddBatchModal onClose={handleAddBatches} onSaved={fetchBatches} />
      )}
    </div>
  );
}
