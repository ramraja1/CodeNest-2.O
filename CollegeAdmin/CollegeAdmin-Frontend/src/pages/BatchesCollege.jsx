import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaPlus,
  FaUsers,
  FaLayerGroup
} from "react-icons/fa";
import AddBatchModal from "../components/AddBatchModel";
import BatchOverview from "./BatchOverview";

export default function ManageBatchesDashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const[addToggle,setAddToggle]=useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const handleAddBatches =()=>{
        setAddToggle(false);
  }

  // Fetch all batches for this college
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${server}/api/batches`, {
        headers: { Authorization: `Bearer ${token}` }
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/college-admin/dashboard")}
          className="flex items-center text-gray-500 hover:text-gray-800 transition text-sm font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Home
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaLayerGroup className="text-emerald-600" /> Manage Batches
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage student batches for your college.
          </p>
        </div>
        <button
          onClick={()=>setAddToggle(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg shadow"
        >
          <FaPlus /> Add Batch
        </button>
      </div>

      {/* Batch Grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading batches...</div>
      ) : batches.length === 0 ? (
        <div className="text-center text-gray-400 bg-white p-10 rounded-xl shadow-sm">
          No batches created yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(batch => (
            <div
              key={batch._id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md hover:scale-[1.02] transition-transform duration-200 cursor-pointer flex flex-col justify-between"
              onClick={() => navigate(`/manage-batches/${batch._id}`)}
            >
              <div className="p-6 flex-1">
                <h2 className="text-lg font-bold text-gray-800 mb-1">
                  {batch.name}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {batch.description || "No description provided"}
                </p>
              </div>

              <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaUsers className="text-emerald-500" />
                  Approved: {batch.approvedCount || 0}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  ⏳ Pending: {batch.pendingCount || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addToggle && (
        <AddBatchModal 
          onClose={handleAddBatches}
          onSaved={fetchBatches}
        />
)}

    </div>
  );
}
