import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaTasks,
  FaUsers,
  FaCopy
} from "react-icons/fa";
import EditBatchModal from "../components/EditBatch";
import ConfirmModal from "../components/DeleteContest";

export default function BatchOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // edit & delete modals
  const [editBatchToggle, setEditBatchToggle] = useState(false);
  const [deleteBatchToggle, setDeleteBatchToggle] = useState(false);
  const handleEditBatchToggle = () => setEditBatchToggle(!editBatchToggle);
  const handleDeleteBatch = () => setDeleteBatchToggle(!deleteBatchToggle);

  //server

   const server=`${import.meta.env.VITE_SERVER}`;

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBatchDetails(); }, [id]);

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
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Loading batch details...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate("/manage-batches")}
          className="flex items-center text-gray-500 hover:text-gray-800 transition text-sm font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Batches
        </button>
      </div>

      {/* Header + Actions + Batch Code */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{batch?.name || "Untitled Batch"}

            </h1>
            {batch?.description && (
              <p className="text-gray-600 mt-1">{batch.description}</p>
            )}

            {/* Batch Code Display */}
          
          </div>
          
 {batch?.batchCode && (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FaEdit /> Edit Batch
            </button>
            <button
              onClick={handleDeleteBatch}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <FaTrash /> Delete Batch
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col items-center justify-center border rounded-lg p-4 shadow-sm">
            <FaUsers className="text-blue-600 text-3xl mb-2" />
            <p className="text-2xl font-bold">{batch.approvedCount || 0}</p>
            <span className="text-gray-500 text-sm">Approved Students</span>
          </div>
          <div className="flex flex-col items-center justify-center border rounded-lg p-4 shadow-sm">
            <FaUsers className="text-yellow-500 text-3xl mb-2" />
            <p className="text-2xl font-bold">{batch.pendingCount || 0}</p>
            <span className="text-gray-500 text-sm">Pending Students</span>
          </div>
          <div className="flex flex-col items-center justify-center border rounded-lg p-4 shadow-sm">
            <FaTasks className="text-green-600 text-3xl mb-2" />
            <p className="text-2xl font-bold">0</p>
            <span className="text-gray-500 text-sm">Total Contests</span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div
          onClick={() => navigate(`/manage-batches/${id}/manage-contest`)}
          className="bg-white p-6 rounded-xl shadow border border-gray-100 hover:shadow-lg transition cursor-pointer flex items-center gap-4"
        >
          <FaTasks className="text-emerald-600 text-3xl" />
          <div>
            <h3 className="font-semibold text-lg">Manage Contests</h3>
            <p className="text-gray-500 text-sm">
              Create or manage contests for this batch
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate(`/college-admin/batches/${id}/students`)}
          className="bg-white p-6 rounded-xl shadow border border-gray-100 hover:shadow-lg transition cursor-pointer flex items-center gap-4"
        >
          <FaUsers className="text-blue-600 text-3xl" />
          <div>
            <h3 className="font-semibold text-lg">Manage Students</h3>
            <p className="text-gray-500 text-sm">
              Approve or remove students from this batch
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
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
