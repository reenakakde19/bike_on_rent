import express from "express";
import {
  registerUser,
  verifyEmail,
  resendOTP,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  deactivateUser
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

/* ================= AUTH ROUTES ================= */

// Register (Send OTP)
router.post("/register", registerUser);

// Verify Email via OTP
router.post("/verify-email", verifyEmail);

// Resend OTP
router.post("/resend-otp", resendOTP);

// Login
router.post("/login", loginUser);


/* ================= USER ROUTES (Protected) ================= */

// Get Profile
router.get("/profile", authMiddleware, getUserProfile);

// Update Profile
router.put("/profile", authMiddleware, updateUserProfile);

// Update Password
router.put("/update-password", authMiddleware, updatePassword);

// Deactivate Account
router.put("/deactivate", authMiddleware, deactivateUser);


/* ================= PASSWORD RESET ================= */

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password/:token", resetPassword);

export default router;
