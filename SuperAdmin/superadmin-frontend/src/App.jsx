import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <>
      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Router setup */}
      <Router>
        <Routes>
          <Route path="/" element={<SuperAdminLogin />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <SuperAdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
