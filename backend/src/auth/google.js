import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js"; // Adjust the path if needed

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found from Google profile"));
        }

        // Try to find user by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Try to find user by email (for first-time Google login)
        user = await User.findOne({ email });

        if (user) {
          // Update the user with googleId if they exist with same email
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // If user does not exist, create new
        const newUser = await User.create({
          fullName: profile.displayName || "Google User",
          email,
          googleId: profile.id,
          password: undefined, // skip password (handled via schema logic)
        });

        return done(null, newUser);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id); // store only the user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // attach the full user object to req.user
  } catch (err) {
    done(err, null);
  }
});
