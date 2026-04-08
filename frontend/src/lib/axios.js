import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : import.meta.env.VITE_API_URL || "https://realtime-chat-app-rtww.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Attach token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("chat-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});