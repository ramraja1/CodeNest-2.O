import { useState } from "react";
import { FaTimes, FaLayerGroup } from "react-icons/fa";
import { toast } from "react-toastify";

 function JoinBatchModal({ onClose, onSaved }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const server = `${import.meta.env.VITE_SERVER}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Batch code is required");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${server}/api/batches/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batchCode: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Joined batch successfully!");
        if (onSaved) onSaved(); // refresh batch list
        onClose(); // close modal
      } else {
        toast.error(data.message || "Failed to join batch");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/20 to-white/15 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden transform transition-all animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <FaLayerGroup className="text-emerald-600 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">
              Join Batch via Code
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. A1B2C3"
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow"
            >
              {loading ? "Joining..." : "Join Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinBatchModal