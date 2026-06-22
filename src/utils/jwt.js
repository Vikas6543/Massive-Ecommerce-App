import jwt from "jsonwebtoken";
import redis from "../config/redis.js";

// ✅ Generate Access Token (short lived)
export const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  });
};

// ✅ Generate Refresh Token (long lived)
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

// ✅ Generate Both Tokens Together
export const generateTokens = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

// ✅ Verify Access Token
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

// ✅ Verify Refresh Token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

// ✅ Blacklist a token in Redis (on logout or rotation)
export const blacklistToken = async (token, expirySeconds) => {
  await redis.set(`blacklist:${token}`, "1", "EX", expirySeconds);
};

// ✅ Check if token is blacklisted
export const isTokenBlacklisted = async (token) => {
  const result = await redis.get(`blacklist:${token}`);
  return result === "1";
};

// ✅ Set Tokens in Cookies
export const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // JS cannot access it
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ✅ Clear Tokens from Cookies
export const clearTokenCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};
