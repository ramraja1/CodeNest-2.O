import React, { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink, Outlet } from "react-router-dom";
import { FaUsers, FaTasks, FaChevronLeft } from "react-icons/fa";
import { toast } from "react-toastify";

export default function BatchPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const server = import.meta.env.VITE_SERVER;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.error("User not logged in");
      navigate("/user-login");
      return;
    }
    fetchBatch();
  }, []);

  const fetchBatch = async () => {
    try {
      const res = await fetch(`${server}/api/batches/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setBatch(data);
      } else {
        toast.error(data.message || "Failed to load batch");
      }
    } catch {
      toast.error("Error fetching batch details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading batch...
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Batch not found.
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar (simpler for batch) */}
      <div className="hidden md:block bg-gray-900 text-white w-64 p-6">
        <h1 className="text-xl font-bold mb-8">Batch</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-6"
        >
          <FaChevronLeft /> Back to Dashboard
        </button>

        <nav className="space-y-3 text-sm">
          <NavLink
            to="overview"
            className={({ isActive }) =>
              `block px-3 py-2 rounded transition ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="contests"
            className={({ isActive }) =>
              `block px-3 py-2 rounded transition ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            Contests
          </NavLink>
          <NavLink
            to="resources"
            className={({ isActive }) =>
              `block px-3 py-2 rounded transition ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            Resources
          </NavLink>
          <NavLink
            to="members"
            className={({ isActive }) =>
              `block px-3 py-2 rounded transition ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            Members
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex justify-between items-center bg-white p-4 shadow sticky top-0">
          <h2 className="font-bold text-xl">{batch.name}</h2>
          <div className="text-sm text-gray-600">
            {batch.students?.length || 0} students
          </div>
        </header>

        {/* Banner / Info */}
        <div className="bg-emerald-100 border-l-4 border-emerald-600 p-4 m-4 rounded">
          <p className="text-gray-800">{batch.description || "No description available."}</p>
        </div>

        {/* Tab Contents */}
        <main className="flex-1 p-6">
          <Outlet context={{ batch }} />
        </main>
      </div>
    </div>
  );
}
