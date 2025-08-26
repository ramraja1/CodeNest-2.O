import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaTasks,
  FaBars,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
  FaBook,
  FaHome,
  FaInfoCircle,
  FaPlay
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

import dotenv from 'dotenv'


// importing components
import JoinBatchModal from "../components/JoinBatchModal";

export default function StudentDashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  //join batch
  const [joinBatchToggle,setJoinBatchToggle]=useState(false);

  // Separate states for each dropdown
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [contestOpen, setContestOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // server

      const server=`${import.meta.env.VITE_SERVER}`;

  useEffect(() => {
    if (!token) {
      toast.error("User not logged in");
      navigate("/user-login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (!decoded.id) {
        throw new Error("Invalid token");
      }
      setUserId(decoded.id);
      setUserName(decoded.name || "Student");
      fetchBatches(decoded.id);
    } catch {
      toast.error("Invalid or expired token");
      localStorage.removeItem("token");
      navigate("/user-login");
    }
  }, []);

  const fetchBatches = async (id) => {
    setLoading(true);
    try {
     
      const res = await fetch(`${server}/api/batches/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
   
      if (res.ok) {
        setBatches(data|| []);
      } else {
        toast.error(data.message || "Failed to load batches");
      }
    } catch {
      toast.error("Server error fetching batches");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading your batches...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">

      {/* = SIDEBAR = */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-50 bg-gray-900 text-white w-64 p-4 min-h-screen transition-transform`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">CodeNest</h1>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>✖</button>
        </div>

        {/* Nav */}
        <nav className="space-y-2 text-sm">

          {/* Dashboard */}
          <div
            className="flex items-center gap-2 hover:bg-white/10 rounded px-3 py-2 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <FaHome /> Dashboard
          </div>

          {/* === Practice Dropdown === */}
          <div>
            <div
              onClick={() => setPracticeOpen(!practiceOpen)}
              className="flex items-center justify-between hover:bg-white/10 rounded px-3 py-2 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FaBook /> Practice
              </span>
              <FaChevronDown
                className={`transition-transform ${practiceOpen ? "rotate-180" : ""}`}
              />
            </div>
            <AnimatePresence>
              {practiceOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-8 mt-1 space-y-1 text-gray-300"
                >
                  <div
                    className="hover:bg-white/10 rounded px-2 py-1 cursor-pointer"
                    onClick={() => navigate("/practice/potd")}
                  >
                    Problem of the Day
                  </div>
                  <div
                    className="hover:bg-white/10 rounded px-2 py-1 cursor-pointer"
                    onClick={() => navigate("/practice/sde-sheet")}
                  >
                    SDE Sheet
                  </div>
                  <div
                    className="hover:bg-white/10 rounded px-2 py-1 cursor-pointer"
                    onClick={() => navigate("/practice/topic-wise-dsa")}
                  >
                    Topic-wise DSA
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* === Contest Dropdown === */}
          <div>
            <div
              onClick={() => setContestOpen(!contestOpen)}
              className="flex items-center justify-between hover:bg-white/10 rounded px-3 py-2 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FaBook /> Contest
              </span>
              <FaChevronDown
                className={`transition-transform ${contestOpen ? "rotate-180" : ""}`}
              />
            </div>
            <AnimatePresence>
              {contestOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-8 mt-1 space-y-1 text-gray-300"
                >
                  <div
                    className="hover:bg-white/10 rounded px-2 py-1 cursor-pointer"
                    onClick={() => navigate("/contest/monthly")}
                  >
                    Monthly Contest
                  </div>
                  <div
                    className="hover:bg-white/10 rounded px-2 py-1 cursor-pointer"
                    onClick={() => navigate("/contest/weekly")}
                  >
                    Weekly Contest
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* === Resources Dropdown === */}
          <div>
            <div
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="flex items-center justify-between hover:bg-white/10 rounded px-3 py-2 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FaBook /> Resources
              </span>
              <FaChevronDown
                className={`transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
              />
            </div>
            <AnimatePresence>
              {resourcesOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-8 mt-1 space-y-1 text-gray-300"
                >
                  <div
                    className="hover:bg-white/10 rounded px-2 py-1 cursor-pointer"
                    onClick={() => navigate("/resources/sheets")}
                  >
                    Important Sheets
                  </div>
                  <div
                    className="hover:bg-white/10 rounded px-2 py-1 cursor-pointer"
                    onClick={() => navigate("/resources/roadmaps")}
                  >
                    Roadmaps
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Practice Ground Button */}
          <div
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 rounded px-3 py-2 cursor-pointer mt-4"
            onClick={() => navigate("/practice-ground")}
          >
            <FaPlay /> Practice Ground
          </div>

          {/* About */}
          <div
            className="flex items-center gap-2 hover:bg-white/10 rounded px-3 py-2 cursor-pointer"
            onClick={() => navigate("/about")}
          >
            <FaInfoCircle /> About
          </div>
        </nav>
      </div>

      {/* = MAIN CONTENT = */}
      <div className="flex-1">
        {/* Topbar */}
        <header className="flex justify-between items-center bg-white p-4 shadow sticky top-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 bg-gray-200 rounded"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars />
            </button>
            <h2 className="font-bold text-2xl">Welcome, {userName}</h2>
          </div>
          <div className="relative">
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="w-10 h-10 rounded-full cursor-pointer border"
              onClick={() => setProfileOpen(!profileOpen)}
            />
            {profileOpen && (
              <div className="absolute right-0 mt-2 bg-white text-gray-800 shadow-lg rounded-lg w-56">
                <div className="px-4 py-2 border-b">
                  <p className="font-semibold">{userName}</p>
                  <p className="text-sm text-gray-500">student@example.com</p>
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer" onClick={() => navigate("/Student-Profile")}>
                  <FaUserCircle /> My Profile
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer text-red-600"
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/user-login");
                  }}
                >
                  <FaSignOutAlt /> Logout
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Join Batch & Batches List */}
        <div className="p-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Your Batches</h1>
            <button
              onClick={()=>setJoinBatchToggle(!joinBatchToggle)}
              className="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 transition"
            >
              Join Batch with Code
            </button>
          </div>

          {batches.length === 0 ? (
            <p className="text-gray-600 text-center">
              You have not joined any batches yet.
            </p>
          ) : (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {batches.map(batch => (
    <div
      key={batch._id}
      className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
      onClick={() => navigate(`/student/batch/${batch._id}`)}
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{batch.name}</h2>
        <p className="text-gray-600 mb-4">{batch.description || "No description provided."}</p>
      </div>
      <div className="flex items-center gap-3 text-gray-700 text-sm">
        <FaUsers className="text-blue-600" />
        <span>{batch.students?.length || 0} students</span>
        <FaTasks className="text-emerald-600 ml-auto" />
        <span>{"N/A"} contests</span> {/* Adjust if have contests count */}
      </div>
    </div>
  ))}
</section>

          )}

          {/* Upcoming Contests */}
          <section className="bg-white rounded-xl shadow p-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
              Upcoming Contests
            </h3>
            <p className="text-gray-600">No upcoming contests at the moment.</p>
          </section>
        </div>
      </div>

            {
          joinBatchToggle && (
            <JoinBatchModal 
              onClose={() => setJoinBatchToggle(false)} 
              onSaved={fetchBatches} // Optional: refresh after joining
            />
          )
        }

    </div>
  );
}
