import { useState,useEffect } from "react";
import student3d from "../assets/login.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export default function CollegeAdminAuthPage() {
  const [showRegister, setShowRegister] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
   const [regPassword, setRegPassword] = useState("");
  const [regContactName, setRegContactName] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/college/login",
        { email: loginEmail, password: loginPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", res.data.token);
      toast.success("Login Successful");
      navigate("/college-dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

 


  // ✅ Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/college/register",
        {
          collegeName: regName,
          email: regEmail,
          contactName: regContactName,
          password:regPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("Registration submitted! Awaiting approval.");
      setRegName("");
      setRegEmail("");
      setRegContactName("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Left Side - Forms */}
      <div className="md:w-1/2 flex flex-col justify-center items-center bg-white p-12">
        {showRegister ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Create College Account
            </h1>
            <form onSubmit={handleRegister} className="space-y-6 w-full max-w-md">
              <input
                type="text"
                placeholder="College Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-green-400"
                required
              />
              <input
                type="email"
                placeholder="College Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-green-400"
                required
              />
              <input
                type="text"
                placeholder="Contact Person Name"
                value={regContactName}
                onChange={(e) => setRegContactName(e.target.value)}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-green-400"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-green-400"
                required
              />
              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {regLoading ? "Submitting..." : "Create Account"}
              </button>
            </form>
            <p className="mt-4 text-gray-600 text-center text-sm">
              Your account will be created upon approval by our team.
            </p>
            <button
              className="mt-6 text-blue-600 hover:underline"
              onClick={() => setShowRegister(false)}
            >
              Already have an account? Sign In
            </button>
            <button
              onClick={() => navigate("/")}
              className="mt-6 flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              College Admin Login
            </h1>
            <form onSubmit={handleLogin} className="space-y-6 w-full max-w-md">
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>
            </form>
            <button
              className="mt-6 text-green-600 hover:underline"
              onClick={() => setShowRegister(true)}
            >
              Don't have an account? Create Account
            </button>
            <button
              onClick={() => navigate("/")}
              className="mt-6 flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </>
        )}
      </div>

      {/* Right Side - Image */}
      <div className="md:w-1/2 flex justify-center items-center bg-gray-50 p-12">
        <img
          src={student3d}
          alt="3D student reading illustration"
          className="max-w-full max-h-[480px] object-contain"
          loading="lazy"
          draggable={false}
        />
      </div>
    </div>
  );
}
