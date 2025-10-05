// hooks/Middleware.ts
import axios from "axios";
import { BACKEND_URL } from "../config";

const axiosPrivate = axios.create({
  baseURL: BACKEND_URL,
});

// Attach JWT token automatically to every request
axiosPrivate.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // store JWT in localStorage
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to catch 403/401 and redirect to /signin
axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      // User is not authenticated → redirect to /signin
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default axiosPrivate;
