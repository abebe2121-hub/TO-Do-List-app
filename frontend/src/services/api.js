
import axios from 'axios';

// Backend API URL from the Vite environment.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create one reusable Axios instance.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT token when one is available.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Keep successful responses unchanged and preserve HTTP/network errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // The request was sent, but no HTTP response was received.
    if (!error.response) {
      error.isNetworkError = true;
    }

    // Pass the original error to the calling service.
    return Promise.reject(error);
  }
);

export default api;
