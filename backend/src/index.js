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
import { app, server } from "./lib/socket.js"
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import "./auth/google.js"; //


dotenv.config();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: false, // true if using HTTPS
    httpOnly: true,
   sameSite: "lax",
  }
}));

app.use(passport.initialize());
app.use(passport.session());


const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
  
});