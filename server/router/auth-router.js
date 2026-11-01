const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyLoginTwoFactor,
  getTwoFactorStatus,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  getMe,
  changePassword,
} = require("../controllers/auth-controller");
const { protect, adminOnly } = require("../middleware/auth-middleware");
const {
  loginLimiter,
  registerLimiter,
  passwordChangeLimiter,
  twoFactorLimiter,
} = require("../middleware/rate-limiter");

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/login/totp", twoFactorLimiter, verifyLoginTwoFactor);
router.get("/me", protect, adminOnly, getMe);
router.get("/totp/status", protect, adminOnly, getTwoFactorStatus);
router.post("/totp/setup", protect, adminOnly, twoFactorLimiter, setupTwoFactor);
router.post("/totp/enable", protect, adminOnly, twoFactorLimiter, enableTwoFactor);
router.post("/totp/disable", protect, adminOnly, twoFactorLimiter, disableTwoFactor);
router.put(
  "/change-password",
  protect,
  adminOnly,
  passwordChangeLimiter,
  changePassword
);

module.exports = router;
