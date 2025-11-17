import dotenv from "dotenv"
import express from "express"
import authRoutes from '../src/routes/auth.route.js'
import messageRoutes from "../src/routes/message.route.js"
import { connectDB } from "./lib/db.js"
import process from "process"
import cookieParser from "cookie-parser";
import { protectRoute } from "./middleware/auth.middleware.js";
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url";
import { app, server } from "./lib/socket.js"

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? process.env.CLIENT_URL 
      : "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  // Correct path to frontend dist folder
  const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");
  
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});