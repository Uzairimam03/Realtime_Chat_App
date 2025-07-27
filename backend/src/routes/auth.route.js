import express from "express"
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import passport from "passport";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

//google auth routes
import { generateToken } from "../lib/generateToken.js"


router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 2. Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true, // If using sessions
  }),
  async (req, res) => {
    // After successful auth
    generateToken(req.user._id, res); // Set JWT cookie
    res.redirect("http://localhost:5173"); // redirect to your frontend
  }
);

// Normal routes with auth
router.post("/signup",signup)

router.post("/login",login)

router.post("/logout",logout)

router.put("/update-profile",protectRoute, updateProfile)

 router.get("/check",protectRoute, checkAuth);

export default router;