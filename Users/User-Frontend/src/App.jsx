import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // fixed import, no braces
import UserAuthPage from "./pages/UserLogin";
import UserLanding from "./pages/UserHome";
import StudentDashboard from "./pages/StudentDashboard";
import BatchPage from "./pages/BatchPage";
import BatchOverview from "./pages/batch/BatchOverview";
import BatchContests from "./pages/batch/BatchContests";
import BatchResources from "./pages/batch/BatchResources";
import BatchMembers from "./pages/batch/BatchMembers";
import ContestPage from "./pages/batch/ContestPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/user-login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token && isTokenValid(token)) {
    return <Navigate to="/student" replace />;
  }
  if (token && !isTokenValid(token)) {
    localStorage.removeItem("token");
  }
  return children;
}

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <UserLanding />
            </PublicRoute>
          }
        />
        <Route
          path="/user-login"
          element={
            <PublicRoute>
              <UserAuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/student/batch/:batchId" element={<BatchPage />}>
          <Route index element={<Navigate to="contests" replace />} /> {/* Default tab */}
          <Route path="overview" element={<BatchOverview />} />
          <Route path="contests" element={<BatchContests />} />
          <Route path="resources" element={<BatchResources />} />
          <Route path="members" element={<BatchMembers />} />
        </Route>
        <Route
          path="/student/batch/:batchId/contest/:contestId"
          element={<ContestPage />}
        />
        {/* Redirect all unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
