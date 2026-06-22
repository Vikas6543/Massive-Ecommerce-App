import ApiError from "../utils/ApiError.js";
import { isTokenBlacklisted, verifyAccessToken } from "../utils/jwt.js";
import UserModel from "../models/UserModel.js";

// ✅ Protect routes - must be logged in
export const protect = async (req, res, next) => {
  let token;

  // get token from cookie or header
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) throw new ApiError(401, "Access denied. Please login.");

  // ✅ Check if token is blacklisted
  const blacklisted = await isTokenBlacklisted(token);
  if (blacklisted)
    throw new ApiError(401, "Token is no longer valid. Please login again.");

  const decoded = verifyAccessToken(token);
  const user = await UserModel.findById(decoded.id);

  if (!user) throw new ApiError(401, "User not found");
  if (user.isBanned) throw new ApiError(403, "Your account has been banned");

  req.user = user;
  req.token = token;
  next();
};

// ✅ Role based access
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role "${req.user.role}" is not allowed to access this route`,
      );
    }
    next();
  };
};
