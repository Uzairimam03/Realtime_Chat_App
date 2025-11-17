import dotenv from "dotenv"
import express from "express"
import authRoutes from './routes/auth.route.js'
import messageRoutes from "./routes/message.route.js"
import { connectDB } from "./lib/db.js"
import process from "process"
import cookieParser from "cookie-parser";
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import { app, server } from "./lib/socket.js"

dotenv.config();

const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  // Try multiple possible paths
  const possiblePaths = [
    path.join(__dirname, "..", "..", "frontend", "dist"),
    path.join(__dirname, "..", "frontend", "dist"),
    path.join(process.cwd(), "frontend", "dist")
  ];
  
  let frontendDistPath = null;
  
  for (const testPath of possiblePaths) {
    console.log("Testing path:", testPath);
    if (fs.existsSync(testPath)) {
      frontendDistPath = testPath;
      console.log("✓ Found dist folder at:", frontendDistPath);
      break;
    }
  }
  
  if (!frontendDistPath) {
    console.error("❌ Could not find frontend/dist folder!");
    console.log("Current directory:", process.cwd());
    console.log("__dirname:", __dirname);
  } else {
    app.use(express.static(frontendDistPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendDistPath, "index.html"));
    });
  }
}

server.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
  console.log("Current working directory:", process.cwd());
  connectDB();
});