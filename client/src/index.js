import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// In production, API calls go to the deployed backend (set REACT_APP_API_URL).
// In development it stays empty, so the "proxy" in package.json is used.
axios.defaults.baseURL = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  </React.StrictMode>
);
