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
import ContestDetailWithQuestions from "./pages/ContestDetailWithQuestions";
import CollegeAdminBatchesDashboard from "./pages/BatchesCollege";
import BatchOverview from "./pages/BatchOverview";
import StudentProgressDashboard from "./pages/StudentProgressDashboard";
import WarmupScreen from "./pages/WarmupScreen";

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

const NotFoundPage = () => (
  <main
    tabIndex="-1"
    className="flex flex-col items-center justify-center h-screen text-gray-600"
  >
    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="mb-6">Sorry, the page you're looking for does not exist.</p>
    <a
      href="/"
      className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
    >
      Go to Home
    </a>
  </main>
);

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
   MAIN APP CONTENT
---------------------- */
function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [showWarmup, setShowWarmup] = useState(true);
  const navigate = useNavigate();

  const server = `${import.meta.env.VITE_SERVER}`;

  // Warm up backend when app loads
useEffect(() => {
  fetch(`${server}/`)
    .then(() => {
      setShowWarmup(false);   // ✅ only runs when backend responds
    })
    .catch(() => console.log("Warm-up failed ❌"));
}, [server]);

// Hide warmup screen after 10 seconds max
useEffect(() => {
  const timer = setTimeout(() => {
    setShowWarmup(false);     // ✅ fallback if backend is slow
  }, 10000);

  return () => clearTimeout(timer);
}, []);


  // Check token/session validity on load
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
              {showWarmup ? <WarmupScreen /> : <CollegeAdminHome />}
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

        <Route
          path="/manage-batches"
          element={
            <PrivateRoute role="collegeadmin">
              <CollegeAdminBatchesDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/student-progress"
          element={
            <PrivateRoute role="collegeadmin">
              <StudentProgressDashboard />
            </PrivateRoute>
          }
        />

        {/* Contest routes */}
        <Route
          path="/manage-batches/:batchId/manage-contest"
          element={
            <PrivateRoute role="collegeadmin">
              <CollegeAdminContestDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/manage-batches/:id"
          element={
            <PrivateRoute role="collegeadmin">
              <BatchOverview />
            </PrivateRoute>
          }
        />

        <Route
          path="/manage-batches/:batchId/contest/:id"
          element={
            <PrivateRoute role="collegeadmin">
              <ContestDetailWithQuestions />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
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