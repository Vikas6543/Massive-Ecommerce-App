import crypto from "crypto";
import UserModel from "../models/UserModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateOTP, generateOTPExpiry } from "../utils/otp.js";
import {
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  verifyRefreshToken,
  isTokenBlacklisted,
  blacklistToken,
} from "../utils/jwt.js";
import {
  sendVerificationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../services/email.service.js";
import redis from "../config/redis.js";
import {
  getDeviceInfo,
  getIPAddress,
  isNewDevice,
} from "../utils/deviceInfo.js";
import {
  sendNewDeviceEmail,
  sendAccountLockedEmail,
} from "../services/email.service.js";

// ✅ REGISTER
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already registered");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await UserModel.create({
    name,
    email,
    password,
    phone,
    emailVerificationToken: verificationToken,
    emailVerificationExpiry: verificationExpiry,
  });

  await sendVerificationEmail(email, name, verificationToken);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { email: user.email },
        "Registration successful! Please verify your email.",
      ),
    );
});

// ✅ VERIFY EMAIL
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) throw new ApiError(400, "Verification token is required");

  const user = await UserModel.findOne({
    emailVerificationToken: token,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired verification token");

  // mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  // send welcome email
  await sendWelcomeEmail(user.email, user.name);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Email verified successfully! You can now login.",
      ),
    );
});

// ✅ SEND OTP
export const sendOTP = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otp = generateOTP();

  // ✅ Store OTP in Redis (auto expires in 10 minutes)
  await redis.set(`otp:${email}`, otp, "EX", 10 * 60);

  // const otpExpiry = generateOTPExpiry(10); // 10 minutes

  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpPurpose = undefined;
  await user.save();

  await sendOTPEmail(email, user.name, otp, purpose);

  res.status(200).json(new ApiResponse(200, null, "OTP sent successfully"));
});

// ✅ VERIFY OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, purpose } = req.body;

  // ✅ Get OTP from Redis
  const storedOTP = await redis.get(`otp:${email}`);

  if (!storedOTP) {
    throw new ApiError(
      400,
      "OTP expired or not found. Please request a new one.",
    );
  }

  if (storedOTP !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // ✅ Delete OTP after verification (one time use)
  await redis.del(`otp:${email}`);

  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (purpose === "email-verification") {
    user.isEmailVerified = true;
    await user.save();
  }

  res.status(200).json(new ApiResponse(200, null, "OTP verified successfully"));
});

// ✅ LOGIN
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // get user with password
  const user = await UserModel.findOne({ email }).select(
    "+password +sessions +loginAttempts +lockUntil",
  );
  if (!user) throw new ApiError(404, "Invalid email or password");

  // ✅ Check if account is locked
  if (user.isLocked) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new ApiError(
      423,
      `Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`,
    );
  }

  // check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // increment failed attempts
    await user.incrementLoginAttempts();

    // send lock email if just locked
    if (user.loginAttempts + 1 >= 5) {
      await sendAccountLockedEmail(user.email, user.name);
    }

    const attemptsLeft = Math.max(0, 5 - (user.loginAttempts + 1));
    throw new ApiError(
      401,
      attemptsLeft > 0
        ? `Invalid email or password. ${attemptsLeft} attempts remaining.`
        : "Account locked due to too many failed attempts.",
    );
  }

  // check email verified
  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  // check if banned
  if (user.isBanned) {
    throw new ApiError(
      403,
      "Your account has been suspended. Please contact support for assistance.",
    );
  }

  // ✅ Reset login attempts (no save here)
  user.loginAttempts = 0;
  user.lockUntil = null;

  // ✅ Get device info
  const deviceInfo = getDeviceInfo(req);
  const ipAddress = getIPAddress(req);

  // ✅ Check if new device
  const newDevice = isNewDevice(user.sessions || [], deviceInfo, ipAddress);
  if (newDevice && user.sessions?.length > 0) {
    // send new device alert (dont await — send in background)
    sendNewDeviceEmail(user.email, user.name, deviceInfo, ipAddress).catch(
      console.error,
    );
  }

  // generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // ✅ Add new session
  user.sessions = user.sessions || [];

  // limit to 5 active sessions
  if (user.sessions.length >= 5) {
    user.sessions.shift(); // remove oldest session
  }

  user.sessions.push({
    refreshToken,
    deviceInfo,
    ipAddress,
    lastActive: new Date(),
  });

  user.lastLogin = new Date();

  // ✅ ONE single save for everything
  await user.save();

  // set cookies
  setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
        isNewDevice: newDevice,
      },
      "Login successful",
    ),
  );
});

// ✅ GET USER PROFILE
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      "Profile fetched successfully",
    ),
  );
});

// ✅ UPDATE USER PROFILE
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await UserModel.findById(req.user._id);

  if (!user) throw new ApiError(404, "User not found");

  if (name !== undefined) {
    user.name = name.trim();
  }

  if (phone !== undefined) {
    user.phone = phone.trim();
  }

  if (avatar !== undefined) {
    if (avatar === null) {
      user.avatar = { url: "", public_id: "" };
    } else if (typeof avatar === "string") {
      user.avatar = { url: avatar, public_id: "" };
    } else if (typeof avatar === "object") {
      user.avatar = {
        url: avatar.url || "",
        public_id: avatar.public_id || "",
      };
    }
  }

  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
      "Profile updated successfully",
    ),
  );
});

// ✅ CHANGE PASSWORD
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await UserModel.findById(req.user._id).select("+password");

  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

// ✅ REFRESH TOKEN (with rotation)
export const refreshToken = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken || req.headers.authorization?.split(" ")[1];

  if (!token) throw new ApiError(401, "Refresh token not found");

  // ✅ Check if refresh token is blacklisted
  const blacklisted = await isTokenBlacklisted(token);
  if (blacklisted) {
    // possible token theft! clear all sessions
    clearTokenCookies(res);
    throw new ApiError(
      401,
      "Refresh token reuse detected. Please login again.",
    );
  }

  // verify token
  const decoded = verifyRefreshToken(token);

  const user = await UserModel.findById(decoded.id).select("+sessions");
  if (!user) throw new ApiError(401, "User not found");

  // check token exists in sessions
  const sessionIndex = user.sessions.findIndex((s) => s.refreshToken === token);

  if (sessionIndex === -1) {
    clearTokenCookies(res);
    throw new ApiError(401, "Invalid refresh token. Please login again.");
  }

  // ✅ Blacklist old refresh token (7 days expiry same as token)
  await blacklistToken(token, 7 * 24 * 60 * 60);

  // ✅ Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id,
    user.role,
  );

  // ✅ Update session with new refresh token
  user.sessions[sessionIndex].refreshToken = newRefreshToken;
  user.sessions[sessionIndex].lastActive = new Date();
  await user.save();

  // ✅ Set new cookies
  setTokenCookies(res, accessToken, newRefreshToken);

  res
    .status(200)
    .json(
      new ApiResponse(200, { accessToken }, "Token refreshed successfully"),
    );
});

// ✅ FORGOT PASSWORD
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });

  // don't reveal if email exists or not (security)
  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "If this email exists, a reset link has been sent",
        ),
      );
  }

  // generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await sendPasswordResetEmail(email, user.name, resetToken);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "If this email exists, a reset link has been sent",
      ),
    );
});

// ✅ RESET PASSWORD
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token) throw new ApiError(400, "Reset token is required");

  const user = await UserModel.findOne({
    passwordResetToken: token,
    passwordResetExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired reset token");

  // update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Password reset successful! Please login."),
    );
});

// ✅ LOGOUT
export const logout = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken || req.headers.authorization?.split(" ")[1];

  // ✅ Blacklist current access token
  if (req.token) {
    await blacklistToken(req.token, 15 * 60); // 15 min (access token expiry)
  }

  if (token) {
    // ✅ Blacklist refresh token
    await blacklistToken(token, 7 * 24 * 60 * 60);

    // ✅ Remove session from DB
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { sessions: { refreshToken: token } },
    });
  }

  clearTokenCookies(res);

  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

// ✅ GET ACTIVE SESSIONS
export const getActiveSessions = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).select("+sessions");

  const sessions = user.sessions.map((session) => ({
    id: session._id,
    deviceInfo: session.deviceInfo,
    ipAddress: session.ipAddress,
    lastActive: session.lastActive,
    createdAt: session.createdAt,
  }));

  res
    .status(200)
    .json(
      new ApiResponse(200, sessions, "Active sessions fetched successfully"),
    );
});

// ✅ LOGOUT FROM SPECIFIC SESSION
export const logoutSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const user = await UserModel.findById(req.user._id).select("+sessions");

  user.sessions = user.sessions.filter(
    (session) => String(session._id) !== String(sessionId),
  );

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Session logged out successfully"));
});

// ✅ LOGOUT FROM ALL SESSIONS
export const logoutAllSessions = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).select("+sessions");

  user.sessions = [];
  await user.save();

  clearTokenCookies(res);

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Logged out from all devices successfully"),
    );
});
