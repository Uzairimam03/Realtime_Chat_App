import dotenv from "dotenv"
import express from "express"
import authRoutes from './routes/auth.route.js'
import messageRoutes from "./routes/message.route.js"
import { connectDB } from "./lib/db.js"
import process from "process"
import cookieParser from "cookie-parser";
import cors from "cors"
import { app, server } from "./lib/socket.js"

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://realtime-chat-app-ten-alpha.vercel.app",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`CORS rejected origin: ${origin}. Allowed: ${allowedOrigins.join(", ")}`);
      return callback(new Error(`CORS policy denied access from ${origin}`));
    },
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
  connectDB();
});