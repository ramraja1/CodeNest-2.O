import { useState } from "react";
import student3d from "../assets/login.png"; // your 3D PNG image with transparent bg
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
export default function SuperAdminLogin() {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const Navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
     
      const res = await fetch(`${import.meta.env.VITE_SERVER}/api/superadmin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {

        if (!data.token) throw new Error("Token missing");


        localStorage.setItem("token", data.token);
       toast.success("Login Successfully")
        Navigate('/dashboard');
        // TODO: Add redirection to dashboard here
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Left Side - Login Panel */}
      <div className="md:w-1/2 flex flex-col justify-center items-center bg-white p-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Super Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="text-red-600 bg-red-100 p-3 rounded text-center font-medium">
                {error}
              </div>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - 3D PNG Illustration */}
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
