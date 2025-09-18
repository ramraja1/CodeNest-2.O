import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaChartLine,
  FaUsers,
  FaTasks,
  FaSignOutAlt,
  FaUsersCog,
} from "react-icons/fa";

import CollegeAdminDashboardSkeleton from "../components/skeleton/CollegeAdminDashboardSkeleton";
import RobotAssistant from "../components/RobotAssistant";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const server = import.meta.env.VITE_SERVER;

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch(
          `${server}/api/college/activities?limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) setActivities(data);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, [token, server]);

  if (loading)
    return (
      <section className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">📢 Recent Activity</h3>
        <div className="text-slate-400 animate-pulse">Loading activity...</div>
      </section>
    );

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">📢 Recent Activity</h3>
      <ul className="space-y-3 text-slate-600">
        {activities.length ? (
          activities.map((a, i) => (
            <li key={a._id || i}>{a.message}</li>
          ))
        ) : (
          <li className="text-slate-400 italic">No recent activity yet.</li>
        )}
      </ul>
    </section>
  );
}

export default function CollegeAdminDashboard() {
  const [stats, setStats] = useState({ batches: 0, students: 0, performance: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const server = import.meta.env.VITE_SERVER;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${server}/api/college/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        } else {
          toast.error("Failed to load stats");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, server]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.success("Logged out");
    navigate("/college-login");
  };
  if (loading) {
  return <CollegeAdminDashboardSkeleton />;
}

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">🎓 College Admin Dashboard</h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={<FaTasks />}
            label="Total Batches"
            value={stats.batches}
            color="blue"
          />
          <StatCard
            icon={<FaUsers />}
            label="Total Students"
            value={stats.students}
            color="green"
          />
          <StatCard
            icon={<FaChartLine />}
            label="Performance"
            value={stats.performance}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <ActionCard
            title="Manage Batches"
            description="Create and manage batches for your college (e.g., CSE 2025, MCA 2026)."
            icon={<FaUsersCog />}
            buttonLabel="Manage Batches"
            onClick={() => navigate("/manage-batches")}
          />
          <ActionCard
            title="Student Progress"
            description="Monitor performance, submissions, and leaderboard."
            icon={<FaUsers />}
            buttonLabel="View Progress"
            onClick={() => navigate("/student-progress")}
          />
        </div>

        {/* Dynamic Recent Activity */}
        <RecentActivity />
      </main>
     
    </div>
 
  );
}

/* ------------------------
   Reusable Components 
------------------------ */
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
      <div className={`w-12 h-12 ${colors[color]} flex items-center justify-center rounded-xl mb-4 text-2xl`}>
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function ActionCard({ title, description, icon, buttonLabel, onClick }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-xl mb-4 text-2xl">
          {icon}
        </div>
        <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
        <p className="text-slate-500 mt-2">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-6 w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
      >
        {buttonLabel}
      </button>
      <RobotAssistant onClick={() => setShowBot(true)} size={80} />
    </div>
  );
}
