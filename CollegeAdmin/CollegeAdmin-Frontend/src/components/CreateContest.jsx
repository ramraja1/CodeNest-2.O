import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";

export default function CreateContest({ batchId, handleCreatetoggle, onContestCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Format datetime-local
  const formatDateForInput = useCallback((dateStr) => {
    const date = new Date(dateStr);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && handleCreatetoggle();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleCreatetoggle]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      handleCreatetoggle();
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setTags("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !startTime || !endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/contests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startTime,
          endTime,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          batchId: batchId || null // ✅ Include batch ID if provided
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Contest created successfully 🎉");
        onContestCreated?.();
        resetForm();
        handleCreatetoggle();
      } else {
        toast.error(data.message || "Failed to create contest");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Modal */}
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 relative animate-scaleIn">
        
        {/* Close Button */}
        <button
          onClick={handleCreatetoggle}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
          title="Close"
        >
          <FaTimes size={20} />
        </button>

        <h1 className="text-2xl font-bold mb-6">Create Contest</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter contest title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the contest..."
            />
          </div>

          {/* Start / End Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Arrays, Easy, DSA"
            />
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg shadow hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Contest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
