import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaPlus,
  FaUsers,
  FaLayerGroup,
} from "react-icons/fa";
import AddBatchModal from "../components/AddBatchModel";
import BatchSkeleton from "../components/skeleton/BatchSkeleton";

export default function ManageBatchesDashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addToggle, setAddToggle] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleAddBatches = () => {
    setAddToggle(false);
  };
  const server = `${import.meta.env.VITE_SERVER}`;

  // Fetch all batches for this college
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
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Back Button */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate("/college-dashboard")}
          className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition font-semibold text-sm gap-2"
          aria-label="Back to Home"
        >
          <FaArrowLeft className="text-lg" /> Back to Home
        </button>
      </div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <FaLayerGroup className="text-emerald-600 text-3xl" />
            Manage Batches
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-xl">
            Create and manage student batches for your college.
          </p>
        </div>
        <button
          onClick={() => setAddToggle(true)}
          className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50"
        >
          <FaPlus className="text-lg" /> Add Batch
        </button>
      </header>

      {/* Batch Grid */}
      {loading ? (
        <BatchSkeleton />
      ) : batches.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 p-16 rounded-xl shadow-lg max-w-lg mx-auto">
          No batches created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {batches.map((batch) => (
            <div
              key={batch._id}
              onClick={() => navigate(`/manage-batches/${batch._id}`)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") navigate(`/manage-batches/${batch._id}`);
              }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl hover:scale-[1.03] transition-transform duration-300 cursor-pointer flex flex-col justify-between focus:ring-4 focus:ring-emerald-400 focus:outline-none"
            >
              <div className="p-8 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight truncate">
                  {batch.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 flex-grow">
                  {batch.description || "No description provided"}
                </p>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between text-gray-600 dark:text-gray-300 text-sm font-medium select-none rounded-b-xl">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-emerald-500" />
                  Approved: {batch.approvedCount || 0}
                </div>
                <div className="flex items-center gap-2">
                  ⏳ Pending: {batch.pendingCount || 0}
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
