import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from "./context/UserContext.jsx";  // import your UserProvider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <UserProvider>
        <App />
      </UserProvider>
    </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
