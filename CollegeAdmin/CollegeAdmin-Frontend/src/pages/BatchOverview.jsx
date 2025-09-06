import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaTasks,
  FaUsers,
  FaBook,
  FaCopy
} from "react-icons/fa";
import EditBatchModal from "../components/EditBatch";
import ConfirmModal from "../components/DeleteContest";
import BatchOverviewSkeleton from "../components/skeleton/BatchOverviewSkeleton";
import { useLocation } from "react-router-dom";

export default function BatchOverview() {

  const location = useLocation();
const {
  totalStudents = 0,
  totalContests = 0,
 
} = location.state ?? {};

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [editBatchToggle, setEditBatchToggle] = useState(false);
  const [deleteBatchToggle, setDeleteBatchToggle] = useState(false);
  const handleEditBatchToggle = () => setEditBatchToggle(!editBatchToggle);
  const handleDeleteBatch = () => setDeleteBatchToggle(!deleteBatchToggle);

  const server = `${import.meta.env.VITE_SERVER}`;

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  async function fetchBatchDetails() {
    setLoading(true);
    try {
      const res = await fetch(`${server}/api/batches/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
     
   
      if (res.ok) {
        setBatch(data.batch || {});
      } else {
        toast.error(data.message || "Failed to fetch batch details");
        navigate("/manage-batches");
      }
    } catch {
      toast.error("Server error fetching batch details");
      navigate("/manage-batches");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBatch() {
    try {
      const res = await fetch(`${server}/api/batches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Batch deleted");
        navigate("/manage-batches");
      } else {
        toast.error("Failed to delete batch");
      }
    } catch {
      toast.error("Server error deleting batch");
    }
  }

  const handleCopyBatchCode = () => {
    navigator.clipboard.writeText(batch.batchCode);
    toast.success("Batch code copied to clipboard!");
  };

  if (loading) {
    return <BatchOverviewSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
  {/* Back Button */}
  <div className="flex items-center">
    <button
      onClick={() => navigate("/manage-batches")}
      className="flex items-center text-gray-600 hover:text-emerald-600 transition text-base font-medium"
    >
      <FaArrowLeft className="mr-2" /> Back to Batches
    </button>
  </div>

  {/* Header + Actions + Batch Code */}
  <div className="bg-white rounded-xl shadow p-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{batch?.name || "Untitled Batch"}</h1>
        {batch?.description && (
          <p className="text-gray-600 mt-1 text-base max-w-lg">{batch.description}</p>
        )}
      </div>
      {batch?.batchCode && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md shadow-sm">
          <span className="font-mono text-sm tracking-wider text-emerald-700">
            {batch.batchCode}
          </span>
          <button
            onClick={handleCopyBatchCode}
            className="text-emerald-600 hover:text-emerald-800"
            title="Copy Batch Code"
          >
            <FaCopy />
          </button>
        </div>
      )}

      {/* Edit/Delete Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleEditBatchToggle}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-1 shadow text-sm"
        >
          <FaEdit className="w-4 h-4" /> Edit Batch
        </button>
        <button
          onClick={handleDeleteBatch}
          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 flex items-center gap-1 shadow text-sm"
        >
          <FaTrash className="w-4 h-4" /> Delete Batch
        </button>
      </div>
    </div>

    {/* Stats & Manage Students */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Total Students */}
      <div className="flex flex-col items-center justify-center border rounded-lg p-4 shadow-sm bg-gray-50">
        <FaUsers className="text-blue-500 text-3xl mb-1" />
        <p className="text-2xl font-semibold text-gray-900">{totalStudents || 0}</p>
        <span className="text-gray-500 text-sm mt-1">Total Students</span>
      </div>

      {/* Total Contests */}
      <div className="flex flex-col items-center justify-center border rounded-lg p-4 shadow-sm bg-gray-50">
        <FaTasks className="text-emerald-500 text-3xl mb-1" />
        <p className="text-2xl font-semibold text-gray-900">{totalContests || 0}</p>
        <span className="text-gray-500 text-sm mt-1">Total Contests</span>
      </div>

      {/* Manage Students */}
      <div
        onClick={() => navigate(`/manage-batches/${id}/manage-students`)}
        className="flex flex-col cursor-pointer items-center justify-center border rounded-lg p-4 shadow-md bg-white hover:shadow-lg transition group outline-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/manage-batches/${id}/manage-students`)}
      >
        <FaUsers className="text-purple-600 text-3xl mb-1 group-hover:text-purple-700 transition" />
        <p className="text-xl font-semibold text-purple-700 group-hover:text-purple-900 transition">Manage</p>
        <span className="text-purple-600 text-sm mt-1 group-hover:text-purple-800 transition">
          Students
        </span>
      </div>
    </div>
  </div>

  {/* Main Actions Section */}
  <div className="grid md:grid-cols-2 gap-5 mt-7">
    {/* Manage Contests */}
    <div
      onClick={() => navigate(`/manage-batches/${id}/manage-contest`)}
      className="bg-white p-6 rounded-xl shadow border border-gray-100 hover:shadow-lg transition cursor-pointer flex items-center gap-4 hover:border-emerald-400 outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/manage-batches/${id}/manage-contest`)}
    >
      <FaTasks className="text-emerald-600 text-3xl" />
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">Manage Contests</h3>
        <p className="text-gray-500 text-sm">Create or manage contests for this batch</p>
      </div>
    </div>

    {/* Manage Resources */}
<div    
      onClick={() => navigate(`/manage-batches/${id}/manage-resources`)}
      className="bg-white p-6 rounded-xl shadow border border-gray-100 hover:shadow-lg transition cursor-pointer flex items-center gap-4 hover:border-purple-400 outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/manage-batches/${id}/manage-resources`)}
    >
      <FaBook className="text-purple-600 text-3xl" />
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">Manage Resources</h3>
        <p className="text-gray-500 text-sm">Upload or organize study materials for this batch</p>
      </div>
    </div>
  </div>
   {editBatchToggle && (
        <EditBatchModal
          batch={batch}
          onClose={handleEditBatchToggle}
          onSaved={fetchBatchDetails}
        />
      )}
      {deleteBatchToggle && (
        <ConfirmModal
          message="Are you sure you want to delete this batch?"
          onConfirm={deleteBatch}
          onCancel={() => setDeleteBatchToggle(false)}
        />
      )}
</div>

  );
}
