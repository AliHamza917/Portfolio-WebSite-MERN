const rateLimit = require("express-rate-limit");

/**
 * Custom handler to return standardized JSON error response
 */
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        message: options.message || "Too many requests, please try again later",
      });
    },
    ...options.extra,
  });
};

// Login: max 10 failed/successful attempts per 15 minutes per IP
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts from this IP, please try again after 15 minutes",
});

// Registration: max 5 attempts per hour per IP
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts from this IP, please try again after 1 hour",
});

// Password change: max 5 attempts per 15 minutes per IP
const passwordChangeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password change attempts, please try again after 15 minutes",
});

const twoFactorLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authenticator attempts, please try again after 15 minutes",
});

module.exports = {
  loginLimiter,
  registerLimiter,
  passwordChangeLimiter,
  twoFactorLimiter,
};
