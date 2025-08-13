import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateContest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      toast.error("Please fill in all required fields");
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
          title,
          description,
          startTime,
          endTime,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Contest created successfully");
        navigate("/college-admin/manage-contests");
      } else {
        toast.error(data.message || "Failed to create contest");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/manage-contests")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <FaArrowLeft className="mr-2" /> Back to Contests
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Create Contest</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
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

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the contest..."
          />
        </div>

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

        <div>
          <label className="block font-medium mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. Arrays, Easy, DSA"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Contest"}
          </button>
        </div>
      </form>
    </div>
  );
}
