import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import UserAuthPage from "./pages/UserLogin";
import UserLanding from "./pages/UserHome";
import StudentDashboard from "./pages/StudentDashboard";
import BatchPage from "./pages/BatchPage";
import BatchOverview from "./pages/batch/BatchOverview";
import BatchContests from "./pages/batch/BatchContests";
import BatchResources from "./pages/batch/BatchResources";
import BatchMembers from "./pages/batch/BatchMembers";
import ContestPage from "./pages/batch/ContestPage";
import WarmupScreen from "./pages/WarmupScreen";

/* ----------------------
   TOKEN HELPERS
---------------------- */
function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/* ----------------------
   ROUTE GUARDS
---------------------- */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/user-login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Only redirect if logged in AND trying to access /user-login
  if (token && isTokenValid(token)) {
    return <Navigate to="/student" replace />;
  }

  return children;
}

/* ----------------------
   MAIN APP
---------------------- */
function App() {
  const [showWarmup, setShowWarmup] = useState(true);
  const server = import.meta.env.VITE_SERVER;

  useEffect(() => {
    let didRespond = false;

    // Call backend immediately
    fetch(`${server}/`)
      .then(() => {
        didRespond = true;
        setShowWarmup(false); // hide immediately if backend ready
      })
      .catch(() => console.log("Warm-up failed ❌"));

    // Fallback → hide after 10s max
    const timer = setTimeout(() => {
      if (!didRespond) {
        setShowWarmup(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [server]);

  if (showWarmup) {
    return <WarmupScreen />;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public homepage */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <UserLanding />
            </PublicRoute>
          }
        />

        {/* Login page */}
        <Route
          path="/user-login"
          element={
            <PublicRoute>
              <UserAuthPage />
            </PublicRoute>
          }
        />

        {/* Student dashboard */}
        <Route
          path="/student/*"
          element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        {/* Batch nested routes */}
        <Route path="/student/batch/:batchId" element={<BatchPage />}>
          <Route index element={<Navigate to="contests" replace />} />
          <Route path="overview" element={<BatchOverview />} />
          <Route path="contests" element={<BatchContests />} />
          <Route path="resources" element={<BatchResources />} />
          <Route path="members" element={<BatchMembers />} />
        </Route>

        {/* Contest page */}
        <Route
          path="/student/batch/:batchId/contest/:contestId"
          element={<ContestPage />}
        />

        {/* Fallback → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
