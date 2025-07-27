import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: function () {
        return !this.googleId; // required only for non-Google users
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 6,
      required: function () {
        return !this.googleId; // required only for non-Google users
      },
    },
    profilePic: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      default: null, // will be set if user logs in via Google
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
