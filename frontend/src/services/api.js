

import axios from "axios";

// Backend API URL from the Vite environment.
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

// Create one reusable Axios instance.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT token when one is available.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle successful responses and preserve errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (!error.response) {
      error.isNetworkError = true;
      error.message =
        error.code === "ECONNABORTED"
          ? "The request timed out. Please try again."
          : "Cannot connect to the server. Check that the backend is running.";
    }


    return Promise.reject(error);
  },
);

export default api;
