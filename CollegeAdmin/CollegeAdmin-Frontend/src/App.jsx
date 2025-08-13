import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

// Pages
import CollegeAdminHome from "./pages/CollegeAdminHome";
import CollegeAdminLogin from "./pages/CollegeAdminLogin";
import CollegeAdminDashboard from "./pages/CollegeAdminDashboard";
import CollegeAdminContestDashboard from "./pages/ContestDashboard";
import CreateContest from "./components/CreateContest";
/* ----------------------
   PRIVATE ROUTE
---------------------- */
function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/college-login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Check expiry
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      toast.error("Session expired. Please login again.");
      return <Navigate to="/college-login" replace />;
    }

    // Check role
    if (role && decoded.role !== role) {
      return <Navigate to="/college-login" replace />;
    }

    return children;
  } catch {
    // Token invalid
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/college-login" replace />;
  }
}

/* ----------------------
   PUBLIC ROUTE
---------------------- */
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decoded = jwtDecode(token);

      // If valid and not expired → send to dashboard
      if (decoded.exp * 1000 > Date.now()) {
        return <Navigate to="/college-dashboard" replace />;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
  }

  return children;
}

/* ----------------------
   MAIN APP
---------------------- */
function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          // Expired → force logout
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          toast.error("Session expired. Please log in again.");
          navigate("/college-login");
        }
      } catch {
        // Invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/college-login");
      }
    }
    setIsReady(true);
  }, [navigate]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Checking session...
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <Routes>
        {/* Public homepage */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <CollegeAdminHome />
            </PublicRoute>
          }
        />

        {/* Login page */}
        <Route
          path="/college-login"
          element={
            <PublicRoute>
              <CollegeAdminLogin />
            </PublicRoute>
          }
        />

        {/* Dashboard (private) */}
        <Route
          path="/college-dashboard"
          element={
            <PrivateRoute role="collegeadmin">
              <CollegeAdminDashboard />
            </PrivateRoute>
          }
        />

            {/*contest  routes*/}
            <Route
            path="/manage-contest"
            element={
              <PrivateRoute role="collegeadmin">
                <CollegeAdminContestDashboard />
              </PrivateRoute>
            }
          />

          <Route
          path="/create-contest"
          element={
            <PrivateRoute role="collegeadmin">
              <CreateContest />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
