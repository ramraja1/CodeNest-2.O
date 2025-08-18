import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSignOutAlt,
  FaUserGraduate,
  FaChartLine,
  FaTrophy,
} from "react-icons/fa";

export default function StudentProgressDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const server = `${import.meta.env.VITE_SERVER}`;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${server}/api/collegeadmin/student-progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setStudents(data || []);
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">👩‍🎓 Students Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Contests Attempted</th>
                  <th className="px-4 py-2 text-left">Problems Solved</th>
                  <th className="px-4 py-2 text-left">Rank</th>
                  <th className="px-4 py-2 text-left">Progress</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {students.length > 0 ? (
                  students.map((s, i) => (
                    <tr
                      key={s._id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2 flex items-center gap-2 font-medium">
                        <FaUserGraduate className="text-emerald-600" />{" "}
                        {s.name}
                      </td>
                      <td className="px-4 py-2">{s.contests}</td>
                      <td className="px-4 py-2">{s.solved}</td>
                      <td className="px-4 py-2 font-semibold text-purple-600">
                        {s.rank}
                      </td>
                      <td className="px-4 py-2">
                        <ProgressBar percentage={s.percentage} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
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
          <LeaderboardPreview students={students} />
        </section>
      </main>
    </div>
  );
}

/* ------------------------
   Reusable Components
------------------------ */

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
  // Sort students (highest progress first) and take top 3
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
              #{i + 1} {s.name}
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
