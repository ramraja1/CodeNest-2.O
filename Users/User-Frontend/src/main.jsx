import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from "./context/UserContext.jsx";  // import your UserProvider
import { Provider } from 'react-redux';
import { store } from './store/store';



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <Provider store={store}>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <UserProvider>
        <App />
      </UserProvider>
    </GoogleOAuthProvider>
    </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
