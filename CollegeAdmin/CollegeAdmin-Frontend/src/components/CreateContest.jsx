import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import { DateTime } from "luxon";

export default function CreateContest({ batchId, handleCreatetoggle, onContestCreated, existingContest }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const server = `${import.meta.env.VITE_SERVER}`;

  // Luxon helpers for date conversion
  const utcToLocalInput = (utcString) => {
    if (!utcString) return "";
    return DateTime.fromISO(utcString, { zone: "utc" })
      .toLocal()
      .toFormat("yyyy-MM-dd'T'HH:mm");
  };

  const localInputToUTC = (localDateTime) => {
    if (!localDateTime) return null;
    return DateTime.fromFormat(localDateTime, "yyyy-MM-dd'T'HH:mm", { zone: "local" })
      .toUTC()
      .toISO();
  };

  // Initialize form with existing contest data if any
  useEffect(() => {
    if (existingContest) {
      setTitle(existingContest.title || "");
      setDescription(existingContest.description || "");
      setStartTime(utcToLocalInput(existingContest.startTime));
      setEndTime(utcToLocalInput(existingContest.endTime));
      setTags((existingContest.tags || []).join(", "));
    }
  }, [existingContest]);

  // Close modal on ESC key
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

  // Reset form fields
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

    if (DateTime.fromFormat(startTime, "yyyy-MM-dd'T'HH:mm") >= DateTime.fromFormat(endTime, "yyyy-MM-dd'T'HH:mm")) {
      toast.error("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${server}/api/contests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startTime: localInputToUTC(startTime),
          endTime: localInputToUTC(endTime),
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          batchId: batchId || null,
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
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-contest-title"
    >
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 relative animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={handleCreatetoggle}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
          title="Close"
        >
          <FaTimes size={20} />
        </button>

        <h1 id="create-contest-title" className="text-2xl font-bold mb-6">
          Create Contest
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              aria-required="true"
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
              aria-multiline="true"
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
                aria-required="true"
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
                aria-required="true"
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

          {/* Submit */}
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
