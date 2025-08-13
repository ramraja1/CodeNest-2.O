import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollegeApprovalList from "../components/CollegeApprovalList";
import StatsCard from "../components/StatsCard";
import SectionWrapper from "../components/SectionWrapper";
import { toast } from "react-toastify";
import { FaUserFriends, FaUniversity, FaClipboardList } from "react-icons/fa";
import dotenv from "dotenv";
export default function SuperAdminDashboard() {
  const [pendingColleges, setPendingColleges] = useState([]);
  const [approvedColleges, setApprovedColleges] = useState([]);
  const [stats, setStats] = useState({
    colleges: 0,
    users: 0,
    contests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError("");
      try {
        // Pending colleges
        const pendingRes = await fetch(
          `${import.meta.env.VITE_SERVER}/api/superadmin/colleges/pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const pendingData = await pendingRes.json();

        // Approved colleges
        const approvedRes = await fetch(
         `${import.meta.env.VITE_SERVER}/api/superadmin/colleges/approved`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const approvedData = await approvedRes.json();

        // Dashboard stats
        const statsRes = await fetch(
          `${import.meta.env.VITE_SERVER}/api/superadmin/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const statsData = await statsRes.json();

        if (pendingRes.ok && statsRes.ok && approvedRes.ok) {
          setPendingColleges(pendingData);
          setApprovedColleges(approvedData);
          setStats(statsData);
        } else {
          setError("Failed to load dashboard data.");
        }
      } catch (err) {
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logout Successfully");
    navigate("/");
  };

  // Action Handler (approve / reject / deactivate)
  const handleApproval = async (id, approve) => {
    try {
      const res = await fetch(
       `${import.meta.env.VITE_SERVER}/api/superadmin/colleges/${id}/${approve ? "approve" : "reject"}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        // Update UI accordingly
        if (approve) {
          // Moved from pending → approved list
          const college = pendingColleges.find(c => c._id === id);
          setPendingColleges(prev => prev.filter(c => c._id !== id));
          if (college) setApprovedColleges(prev => [...prev, { ...college, status: "approved" }]);
        } else {
          // Removing from both lists if rejected
          setPendingColleges(prev => prev.filter(c => c._id !== id));
          setApprovedColleges(prev => prev.filter(c => c._id !== id));
        }
        toast.success(approve ? "College Approved" : "College Rejected");
      } else {
        toast.error("Action failed");
      }
    } catch {
      toast.error("Error connecting to server");
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-gray-500">Loading dashboard...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-6 border-b">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Super Admin Dashboard
        </h2>
        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition font-semibold"
        >
          Logout
        </button>
      </header>

      {!!error && (
        <SectionWrapper>
          <div className="text-red-600">{error}</div>
        </SectionWrapper>
      )}

      {/* Stats */}
      <SectionWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard
            title="Pending Colleges"
            value={pendingColleges.length}
            icon={<FaUniversity />}
            color="orange"
          />
          <StatsCard
            title="Total Users"
            value={stats.users}
            icon={<FaUserFriends />}
            color="blue"
          />
          <StatsCard
            title="Total Contests"
            value={stats.contests}
            icon={<FaClipboardList />}
            color="purple"
          />
        </div>
      </SectionWrapper>

      {/* Pending Colleges Approval List */}
      <SectionWrapper title="Pending College Approvals">
        {pendingColleges.length === 0 ? (
          <div className="text-gray-500">No pending colleges to approve.</div>
        ) : (
          <CollegeApprovalList
            colleges={pendingColleges}
            onAction={handleApproval}
            status="pending"
          />
        )}
      </SectionWrapper>

      {/* Approved Colleges List — Allow reject/deactivate */}
      <SectionWrapper title="Approved Colleges">
        {approvedColleges.length === 0 ? (
          <div className="text-gray-500">No approved colleges found.</div>
        ) : (
          <CollegeApprovalList
            colleges={approvedColleges}
            onAction={(id) => handleApproval(id, false)} // false = reject/deactivate
          />
        )}
      </SectionWrapper>
    </div>
  );
}
