import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // fixed import, no braces
import UserAuthPage from "./pages/UserLogin";
import UserLanding from "./pages/UserHome";
import StudentDashboard from "./pages/StudentDashboard";

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
    return <Navigate to="/user-dashboard" replace />;
  }
  if (token && !isTokenValid(token)) {
    localStorage.removeItem("token");
  }
  return children;
}

function App() {
  return (
    <Router>
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
          path="/user-dashboard/*"
          element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        {/* Redirect all unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
