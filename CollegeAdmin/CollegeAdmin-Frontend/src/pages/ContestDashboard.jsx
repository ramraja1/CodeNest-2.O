import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaSearch,
  FaTimes,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import CreateContest from "../components/CreateContest";
import ContestDashboardSkeleton from "../components/skeleton/ContestDashboardSkeleton";
import RobotAssistant from "../components/RobotAssistant";
// ✅ Reusable Banner Component
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-4 shadow-sm">
      {message}
    </div>
  );
}

// ✅ Empty State for Contests
function EmptyContests({ onCreate }) {
  return (
    <div className="col-span-full flex flex-col items-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
      <p className="text-gray-500 mb-4">No contests created yet for this batch.</p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md transition"
      >
        <FaPlus /> Create New Contest
      </button>
    </div>
  );
}

// ✅ Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <svg
        className="animate-spin h-10 w-10 text-emerald-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading spinner"
        role="img"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  );
}

// ✅ Contest Card Component
function ContestCard({ contest, onOpen }) {
  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);

  const status =
    now < startTime
      ? "Upcoming"
      : now >= startTime && now <= endTime
      ? "Ongoing"
      : "Ended";

  return (
    <div
      onClick={() => onOpen(contest._id)}
      className={`bg-white rounded-2xl cursor-pointer shadow-sm hover:shadow-lg hover:scale-[1.02] transition-transform duration-200 overflow-hidden border-l-4 
      ${
        status === "Ongoing"
          ? "border-emerald-500"
          : status === "Upcoming"
          ? "border-blue-500"
          : "border-gray-400"
      }`}
    >
      <div className="p-6 flex flex-col justify-between min-h-[220px]">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
            {contest.title}
          </h2>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
            <FaClock className="text-gray-400" /> {startTime.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" /> {endTime.toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {contest.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div
          className={`mt-auto text-xs font-semibold w-fit px-3 py-1.5 rounded-full ${
            status === "Ongoing"
              ? "bg-emerald-100 text-emerald-700"
              : status === "Upcoming"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {status}
        </div>
      </div>
    </div>
  );
}

// ✅ Search & Filter Bar Component
function FilterBar({ search, setSearch, filter, setFilter, onClear }) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-8 gap-4">
      <div className="flex items-center w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        {search && (
          <button
            onClick={onClear}
            className="ml-2 p- text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center  gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg text-sm px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All Contests </option>
          <option value="ongoing">Ongoing</option>
          <option value="upcoming">Upcoming</option>
          <option value="ended">Ended</option>
        </select>
      </div>
    </div>
  );
}

// ✅ Main Dashboard
export default function CollegeAdminContestDashboard() {
  const { batchId } = useParams();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createToggle, setCreateToggle] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const server = `${import.meta.env.VITE_SERVER}`;

  // Fetch contests API
  const fetchContests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${server}/api/contests?batchId=${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setContests(
          data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        );
      } else {
        setError(data.message || "Failed to load contests");
      }
    } catch {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
    // eslint-disable-next-line
  }, [token, batchId]);

  // Filters applied
  const filteredContests = useMemo(() => {
    const now = new Date();
    return contests
      .filter((c) => {
        // Search filter
        if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
          return false;
        // Status filter
        const start = new Date(c.startTime);
        const end = new Date(c.endTime);
        if (filter === "ongoing" && !(now >= start && now <= end)) return false;
        if (filter === "upcoming" && !(now < start)) return false;
        if (filter === "ended" && !(now > end)) return false;
        return true;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [contests, search, filter]);

  const handleCreatetoggle = () => setCreateToggle(false);
  const handleCreate = () => setCreateToggle(true);

  if (loading) {
    return <ContestDashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(`/manage-batches/${batchId}`)}
          className="flex items-center text-gray-500 hover:text-gray-800 transition text-sm font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Your Batch
        </button>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Manage Contests
      </h1>

      {/* Search & Filter */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        onClear={() => setSearch("")}
      />

      {/* Error Banner */}
      <ErrorBanner message={error} />

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Add Contest Card */}
        <div
          onClick={handleCreate}
          className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-dashed border-emerald-400 hover:bg-emerald-50 cursor-pointer transition hover:shadow-lg min-h-[220px]"
        >
          <FaPlus className="text-emerald-500 text-4xl mb-3" />
          <p className="font-semibold text-emerald-600 text-lg">Add Contest</p>
        </div>

        {/* Contest List */}
        {filteredContests.length === 0 ? (
          <EmptyContests onCreate={handleCreate} />
        ) : (
          filteredContests.map((contest) => (
            <ContestCard
              key={contest._id}
              contest={contest}
              onOpen={(id) =>
                navigate(`/manage-batches/${batchId}/contest/${id}`)
              }
            />
          ))
        )}
      </div>

      {/* Create Contest Modal */}
      {createToggle && (
        <CreateContest
          batchId={batchId}
          handleCreatetoggle={handleCreatetoggle}
          onContestCreated={fetchContests}
        />
      )}
       <RobotAssistant onClick={() => setShowBot(true)} size={80} />
    </div>
  );
}
