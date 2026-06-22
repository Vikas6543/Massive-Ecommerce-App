import express from "express";
import {
  register,
  verifyEmail,
  sendOTP,
  verifyOTP,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
  getActiveSessions,
  logoutSession,
  logoutAllSessions,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.get("/verify-email", verifyEmail);
router.post("/send-otp", validate(sendOTPSchema), sendOTP);
router.post("/verify-otp", validate(verifyOTPSchema), verifyOTP);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/logout", protect, logout);

// ✅ Session management
router.get("/sessions", protect, getActiveSessions);
router.delete("/sessions/:sessionId", protect, logoutSession);
router.delete("/sessions", protect, logoutAllSessions);

export default router;
