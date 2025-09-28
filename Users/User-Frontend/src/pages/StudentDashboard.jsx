import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers, FaTasks, FaBars, FaSignOutAlt, FaUserCircle, FaChevronDown, FaBook, FaHome, FaInfoCircle, FaPlay
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useGetMeQuery } from "../store/apiSlice";
import JoinBatchModal from "../components/JoinBatchModal";

export default function StudentDashboard() {
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [joinBatchToggle, setJoinBatchToggle] = useState(false);

  const [practiceOpen, setPracticeOpen] = useState(false);
  const [contestOpen, setContestOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const server = import.meta.env.VITE_SERVER;

  // 1. Decode token synchronously and gate everything by its presence
  let decoded = null;
  try {
    decoded = token ? jwtDecode(token) : null;
  } catch {}
  const userId = decoded?.id ?? null;
  const userName = decoded?.name ?? "Student";

  // 2. Use RTK Query for user data (skip if not logged in)
  const { data: user, error: userError, isLoading: userLoading } = useGetMeQuery(undefined, { skip: !token });

  // 3. Handle redirect on bad/missing token
  useEffect(() => {
    if (!token || !userId) {
      toast.error("User not logged in");
      navigate("/user-login");
    }
  }, [token, userId, navigate]);

  // 4. Fetch batches only after having a valid userId and token
  useEffect(() => {
    if (!token || !userId) return;
    const fetchBatches = async () => {
      setBatchLoading(true);
      try {
        const res = await fetch(`${server}/api/batches/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setBatches(res.ok ? data : []);
        if (!res.ok) toast.error(data.message || "Failed to load batches");
      } catch {
        toast.error("Server error fetching batches");
      } finally {
        setBatchLoading(false);
      }
    };
    fetchBatches();
  }, [token, userId, server]);

  // 5. Show loading while either query or batches loading
  if (userLoading || batchLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading your batches...
      </div>
    );
  }

  // 6. Render dashboard only when user and batches are loaded
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-50 bg-gray-900 text-white w-64 p-4 min-h-screen transition-transform`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <img
              src="/CodenestLogo.png"
              alt="CodeNest Logo"
              className="h-8 w-8 rounded-xl"
            />
            <span className="font-bold tracking-wide">CodeNest</span>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>✖</button>
        </div>
        <nav className="space-y-2 text-sm">
          <div
            className="flex items-center gap-2 hover:bg-white/10 rounded px-3 py-2 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <FaHome /> Dashboard
          </div>
          {/* Practice Dropdown */}
          <DropdownNav
            label="Practice"
            icon={<FaBook />}
            open={practiceOpen}
            setOpen={setPracticeOpen}
            items={[
              { label: "Problem of the Day", onClick: () => navigate("/practice/potd") },
              { label: "SDE Sheet", onClick: () => navigate("/practice/sde") },
              // { label: "Topic-wise DSA", onClick: () => navigate("/practice/topic-wise-dsa") }
            ]}
          />
          {/* Contest Dropdown */}
          <DropdownNav
            label="Contest"
            icon={<FaBook />}
            open={contestOpen}
            setOpen={setContestOpen}
            items={[
              { label: "Monthly Contest", onClick: () => navigate("/contest/monthly") },
              { label: "Weekly Contest", onClick: () => navigate("/contest/weekly") }
            ]}
          />
          {/* Resources Dropdown */}
          <DropdownNav
            label="Resources"
            icon={<FaBook />}
            open={resourcesOpen}
            setOpen={setResourcesOpen}
            items={[
              { label: "Important Sheets", onClick: () => navigate("/resources/sheets") },
              { label: "Roadmaps", onClick: () => navigate("/resources/roadmaps") }
            ]}
          />
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

      {/* Main Content */}
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
            <h2 className="font-bold text-2xl">Welcome, {user?.name || userName}</h2>
         
          </div>
          <div className="relative">
            <img
              src={user?.avatarUrl}
              alt="profile"
              className="w-10 h-10 rounded-full cursor-pointer border"
              onClick={() => setProfileOpen((open) => !open)}
            />
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 bg-white text-gray-800 shadow-lg rounded-lg w-56"
                >
                  <div className="px-4 py-2 border-b">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Join Batch & Batches List */}
        <div className="p-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Your Batches</h1>
            <button
              onClick={() => setJoinBatchToggle(true)}
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
                    <span>{batch.contestsCount} contests</span>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Upcoming Contests */}
         
        </div>
      </div>

      {/* Modal for joining batch */}
      <AnimatePresence>
        {joinBatchToggle && (
          <JoinBatchModal
            onClose={() => setJoinBatchToggle(false)}
            onSaved={() => {
              // Refetch batches after joining
              // Call the fetch batches logic here or just reload page if needed
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Dropdown Menu as a helper subcomponent
function DropdownNav({ label, icon, open, setOpen, items }) {
  return (
    <div>
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between hover:bg-white/10 rounded px-3 py-2 cursor-pointer"
      >
        <span className="flex items-center gap-2">{icon} {label}</span>
        <FaChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24 }}
            className="ml-8 mt-1 space-y-1 text-gray-300"
          >
            {items.map((item, i) => (
              <div
                key={i}
                className="hover:bg-white/10 rounded px-2 py-1 cursor-pointer"
                onClick={item.onClick}
              >
                {item.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
