import React, { createContext, useState, useEffect } from "react";
import { jwtDecode} from "jwt-decode";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// 1. Create the context
export const UserContext = createContext(null);

// 2. Create the provider component
export function UserProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
   const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
   
    if (!token) {
      toast.error("User not logged in");
      navigate("/user-login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded.id) {
        throw new Error("Invalid token");
      }
      setUserId(decoded.id);
      setUserName(decoded.name || "Student");
    } catch (error) {
      toast.error("Invalid or expired token");
      localStorage.removeItem("token");
      navigate("/user-login");
    }
  }, [navigate]);

  return (
    <UserContext.Provider value={{ userId, userName ,token }}>
      {children}
    </UserContext.Provider>
  );
}
