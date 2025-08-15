import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";

export default function EditContest({ contestId, initialData, onClose, onContestUpdated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch contest before editing (if initialData isn't passed)
  useEffect(() => {
    if (initialData) {
      fillForm(initialData);
      setFetching(false);
    } else if (contestId) {
      fetchContestData();
    }
  }, [contestId]);

  const fillForm = (data) => {
    setTitle(data.title || "");
    setDescription(data.description || "");
    setStartTime(data.startTime ? formatDateForInput(data.startTime) : "");
    setEndTime(data.endTime ? formatDateForInput(data.endTime) : "");
    setTags(data.tags ? data.tags.join(", ") : "");
  };

  const fetchContestData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/contests/${contestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        fillForm(data);
      } else {
        toast.error(data.message || "Failed to fetch contest details");
        onClose();
      }
    } catch {
      toast.error("Error connecting to server");
      onClose();
    } finally {
      setFetching(false);
    }
  };

  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/contests/${contestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          startTime,
          endTime,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Contest updated successfully");
        onContestUpdated?.();
        onClose();
      } else {
        toast.error(data.message || "Failed to update contest");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg">Loading contest...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/20 to-white/10 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
        >
          <FaTimes size={20} />
        </button>

        <h1 className="text-2xl font-bold mb-6">Edit Contest</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title *</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter contest title"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the contest..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Start Time *</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">End Time *</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Tags</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Arrays, Easy, DSA"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Contest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
