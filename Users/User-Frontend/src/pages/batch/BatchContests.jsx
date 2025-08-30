// pages/batch/BatchContests.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Navigate,useNavigate } from "react-router-dom";

export default function BatchContests() {
  const { batchId } = useParams();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();
  const server = import.meta.env.VITE_SERVER;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await fetch(`${server}/api/contests?batchId=${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        // sort: active first, then upcoming, then past
        const now = new Date();
        const sorted = data.sort((a, b) => {
          const aStatus = getContestStatus(a, now);
          const bStatus = getContestStatus(b, now);
          const order = { active: 0, upcoming: 1, past: 2 }; // priority
          return order[aStatus] - order[bStatus];
        });
        setContests(sorted);
      } else {
        toast.error(data.message || "Failed to load contests");
      }
    } catch {
      toast.error("Server error fetching contests");
    } finally {
      setLoading(false);
    }
  };

  // helper: determine status based on time
  const getContestStatus = (contest, now) => {
    if (new Date(contest.startTime) <= now && new Date(contest.endTime) >= now) {
      return "active"; // ongoing
    } else if (new Date(contest.startTime) > now) {
      return "upcoming"; // not started yet
    } else {
      return "past"; // deadline crossed
    }
  };

 const handleContestClick = (contest) => {
  // status from Mongoose schema
  if (contest.status === "completed") {
    toast.info("You have already submitted .");
    return;
  }
  // status based on time (guard against old data)
  const now = new Date();
  if (new Date(contest.startTime) > now) {
    toast.info("This contest is upcoming. Please wait for it to start.");
    return;
  }
  if (new Date(contest.endTime) < now) {
    toast.error("This contest has ended.");
    return;
  }
  // Only go to contest if it's not completed, within allowed time window
  navigate(`/student/batch/${batchId}/contest/${contest._id}`);
};



  if (loading) return <p className="text-gray-500">Loading contests...</p>;
  if (!contests.length) return <p className="text-gray-600">No contests found for this batch.</p>;

  return (
    <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {contests.map((contest) => {
        const now = new Date();
        const status = getContestStatus(contest, now);

        return (
          <div
            key={contest._id}
            onClick={() => handleContestClick(contest, status)}
            className={`rounded-lg shadow p-6 transition cursor-pointer border-l-4 ${
              status === "active"
                ? "bg-green-50 border-green-600 hover:shadow-lg"
                : status === "upcoming"
                ? "bg-yellow-50 border-yellow-500 hover:shadow-lg"
                : "bg-red-50 border-red-600 hover:shadow-lg"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900">{contest.title}</h3>
            <p className="text-gray-600 mb-3">
              {contest.description || "No description"}
            </p>

            <p className="text-sm text-gray-500">
              {new Date(contest.startTime).toLocaleString()} →{" "}
              {new Date(contest.endTime).toLocaleString()}
            </p>

            <span
              className={`inline-block mt-3 px-3 py-1 rounded text-xs font-semibold ${
                status === "active"
                  ? "bg-green-600 text-white"
                  : status === "upcoming"
                  ? "bg-yellow-500 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {status === "active"
                ? "Active"
                : status === "upcoming"
                ? "Upcoming"
                : "Ended"}
            </span>
          </div>
        );
      })}
    </section>
  );
}
