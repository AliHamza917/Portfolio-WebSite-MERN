import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./global/context/ThemeContext";

// In production, API calls go to the deployed backend (set REACT_APP_API_URL).
// In development it stays empty, so the "proxy" in package.json is used.
// Strip trailing slashes and any trailing '/api' since individual requests include '/api'
const rawApiUrl = (process.env.REACT_APP_API_URL || "").trim().replace(/\/$/, "");
axios.defaults.baseURL = rawApiUrl.endsWith("/api")
  ? rawApiUrl.slice(0, -4)
  : rawApiUrl;

// Intercept 401 Unauthorized responses to auto-logout expired sessions
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      window.location.pathname.startsWith("/admin") &&
      window.location.pathname !== "/admin/login"
    ) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
