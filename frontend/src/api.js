import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach Authorization header safely
API.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token"); // we store token separately
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("⚠️ Failed to read auth token:", err);
  }
  return config;
});

export default API;
