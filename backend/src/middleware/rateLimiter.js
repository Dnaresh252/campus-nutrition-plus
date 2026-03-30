const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 * Prevents abuse while handling high traffic
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth endpoints limiter (stricter for security)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 login attempts per 15 min
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Feedback submission limiter
 * Allows multiple submissions but prevents spam
 */
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 submissions per minute (generous for meal times)
  message: {
    success: false,
    error: "Slow down! Please wait before submitting again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin endpoints limiter
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Admins need more for menu management
  message: {
    success: false,
    error: "Admin rate limit exceeded",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  feedbackLimiter,
  adminLimiter,
};
