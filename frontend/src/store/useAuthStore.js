import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : (import.meta.env.VITE_API_URL || "https://realtime-chat-app-rtww.onrender.com").replace("/api", "");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("chat-token");
      if (!token) {
        set({ authUser: null, isCheckingAuth: false });
        return;
      }
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      localStorage.removeItem("chat-token");
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      localStorage.setItem("chat-token", res.data.token);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      localStorage.setItem("chat-token", res.data.token);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.log("Logout error:", error.message);
    } finally {
      localStorage.removeItem("chat-token");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || error.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket: existingSocket } = get();
    if (!authUser) return;
    if (existingSocket?.connected) return;
    if (existingSocket) existingSocket.disconnect();

    const token = localStorage.getItem("chat-token");

    const socket = io(SOCKET_URL, {
      auth: { userId: authUser._id, token },
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (error) => console.error("Socket error:", error));
    socket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));
    socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));

    set({ socket });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));