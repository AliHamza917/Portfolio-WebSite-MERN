const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user-model");
const {
  validateJwtSecret,
  isValidJwtFormat,
} = require("../utills/auth-validator");

/**
 * Protect middleware:
 * - Validates JWT format
 * - Verifies signature using validated JWT_SECRET
 * - Prevents internal error leakage
 * - Loads user and enforces admin role
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Not authorized, no token provided",
    });
  }

  const token = authHeader.slice(7).trim();

  // Validate token structure before calling crypto functions
  if (!isValidJwtFormat(token)) {
    return res.status(401).json({
      message: "Not authorized, invalid token format",
    });
  }

  // Ensure JWT secret is valid and strong
  const secretValidation = validateJwtSecret();
  if (!secretValidation.valid) {
    console.error("JWT Configuration Failure:", secretValidation.message);
    return res.status(500).json({
      message: "Authentication service configuration error",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, secretValidation.secret);
  } catch (err) {
    // Return consistent 401 response without exposing internal error or stack traces
    return res.status(401).json({
      message: "Not authorized, token invalid or expired",
    });
  }

  if (!decoded || !decoded.id) {
    return res.status(401).json({
      message: "Not authorized, token payload is invalid",
    });
  }

  let user;
  try {
    user = await User.findById(decoded.id).select("-password +sessionVersion");
  } catch (err) {
    return res.status(401).json({
      message: "Not authorized, user lookup failed",
    });
  }

  if (!user) {
    return res.status(401).json({
      message: "Not authorized, user not found",
    });
  }

  if ((decoded.sv || 0) !== (user.sessionVersion || 0)) {
    return res.status(401).json({
      message: "Not authorized, please sign in again",
    });
  }

  if (user.twoFactorEnabled && decoded.mfa !== true) {
    return res.status(401).json({
      message: "Not authorized, multi-factor authentication is required",
    });
  }

  // Enforce role authorization
  if (user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: Admin privileges required",
    });
  }

  req.user = user;
  next();
});

/**
 * Explicit role check middleware for routes requiring admin privileges
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: Admin privileges required",
    });
  }
  next();
};

module.exports = { protect, adminOnly };
