import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSignOutAlt,
  FaUserGraduate,
  FaChartLine,
  FaTrophy,
  FaFilter,
} from "react-icons/fa";

// Utility for sorting students
function sortStudents(students, key, desc = true) {
  return [...students].sort((a, b) =>
    desc ? (b[key] ?? 0) - (a[key] ?? 0) : (a[key] ?? 0) - (b[key] ?? 0)
  );
}

export default function StudentProgressDashboard() {
  const [rawData, setRawData] = useState({ batches: [], students: [] });
  const [batchFilter, setBatchFilter] = useState("all");
  const [sortKey, setSortKey] = useState("percentage");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const server = `${import.meta.env.VITE_SERVER}`;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${server}/api/college/student-progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setRawData(data || { batches: [], students: [] });
        } else {
          toast.error("Failed to load student progress");
        }
      } catch {
        toast.error("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.success("Logged out");
    navigate("/college-login");
  };

  // Compute students filtered by batch
  const students = rawData.students.filter((s) =>
    batchFilter === "all" ? true : (s.batches || []).includes(batchFilter)
  );
  const sortedStudents = sortStudents(students, sortKey, true);

  // For UI legend
  const batchOptions = rawData.batches.map((b) => ({
    id: b._id,
    name: b.name,
  }));

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-slate-500 animate-pulse">
          Loading student progress...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-slate-200 px-3 py-2 rounded-lg hover:bg-slate-300 transition"
            >
              <FaArrowLeft /> Back
            </button>
            <h2 className="text-2xl font-bold text-slate-800">
              🎓 Student Progress Dashboard
            </h2>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* Filters */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="flex flex-wrap items-center gap-6 mb-6">
          <span className="text-slate-700 flex items-center gap-2">
            <FaFilter /> <b>Batch Filter</b>
          </span>
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="p-2 rounded-lg border border-slate-300"
          >
            <option value="all">All Batches</option>
            {batchOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <span className="mx-4"></span>
          <span className="text-slate-700 flex items-center gap-2">
            <b>Sort by</b>
          </span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="p-2 rounded-lg border border-slate-300"
          >
            <option value="percentage">Progress %</option>
            <option value="contests">Contests</option>
            <option value="solved">Problems Solved</option>
            <option value="rank">Rank</option>
          </select>
        </section>

        {/* Students Table */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">👩‍🎓 Students Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Batch</th>
                  <th className="px-4 py-2 text-left">Contests Attempted</th>
                  <th className="px-4 py-2 text-left">Problems Solved</th>
                  <th className="px-4 py-2 text-left">Rank</th>
                  <th className="px-4 py-2 text-left">Progress</th>
                  <th className="px-4 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {sortedStudents.length > 0 ? (
                  sortedStudents.map((s, i) => (
                    <tr
                      key={s._id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2 flex items-center gap-2 font-medium">
                        {s.avatarUrl ? (
                          <img
                            src={s.avatarUrl}
                            alt={s.name}
                            className="inline rounded-full w-7 h-7 object-cover border"
                          />
                        ) : (
                          <FaUserGraduate className="text-emerald-600" />
                        )}
                        {s.name}
                      </td>

                      <td className="px-4 py-2">
                        {(s.batches || [])
                          .map(
                            (bid) =>
                              batchOptions.find((opt) => opt.id === bid)?.name
                          )
                          .join(", ")}
                      </td>
                      <td className="px-4 py-2">{s.contests}</td>
                      <td className="px-4 py-2">{s.solved}</td>
                      <td className="px-4 py-2 font-semibold text-purple-600">
                        {s.rank}
                      </td>
                      <td className="px-4 py-2">
                        <ProgressBar percentage={s.percentage} />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="text-emerald-700 font-medium underline"
                          onClick={() => navigate(`/student/${s._id}/progress`)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center text-slate-400 italic py-4"
                    >
                      No student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Leaderboard Summary */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">🏆 Top Performers</h3>
          <LeaderboardPreview students={sortedStudents} />
        </section>
      </main>
    </div>
  );
}

function ProgressBar({ percentage }) {
  return (
    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
      <div
        className="bg-emerald-500 h-3 transition-all duration-500"
        style={{ width: `${percentage || 0}%` }}
      ></div>
    </div>
  );
}

function LeaderboardPreview({ students }) {
  const top3 = [...students]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);
  return (
    <ul className="space-y-3">
      {top3.length > 0 ? (
        top3.map((s, i) => (
          <li
            key={s._id}
            className="flex items-center justify-between text-slate-700 bg-slate-50 p-3 rounded-lg"
          >
            <span>
              <FaTrophy className="inline text-yellow-500 mr-1" />#{i + 1}{" "}
              {s.name}
            </span>
            <span className="font-medium flex items-center gap-2">
              <FaChartLine className="text-emerald-600" /> {s.percentage}%
            </span>
          </li>
        ))
      ) : (
        <p className="text-slate-400 italic">No leaderboard data available.</p>
      )}
    </ul>
  );
}
