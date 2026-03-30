const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  checkSubmission,
  getMyFeedback,
  getLiveFeedbackStats,
  getAnalytics,
  exportFeedback,
} = require("../controllers/feedbackController");
const {
  authenticateStudent,
  authenticateAdmin,
} = require("../middleware/auth");
const { validate, validateFeedback } = require("../utils/validation");
const { feedbackLimiter } = require("../middleware/rateLimiter");

// ========================================
// STUDENT ROUTES
// ========================================

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback
 * @access  Protected (Student)
 */
router.post(
  "/",
  authenticateStudent,
  feedbackLimiter,
  validate(validateFeedback),
  submitFeedback,
);

/**
 * @route   GET /api/feedback/check/:date/:mealType
 * @desc    Check if already submitted for this meal
 * @access  Protected (Student)
 */
router.get("/check/:date/:mealType", authenticateStudent, checkSubmission);

/**
 * @route   GET /api/feedback/my
 * @desc    Get my feedback history
 * @access  Protected (Student)
 */
router.get("/my", authenticateStudent, getMyFeedback);

// ========================================
// ADMIN ROUTES
// ========================================

/**
 * @route   GET /api/feedback/admin/live/:date/:mealType
 * @desc    Get live feedback stats for specific date and meal
 * @access  Protected (Admin)
 */
router.get(
  "/admin/live/:date/:mealType",
  authenticateAdmin,
  getLiveFeedbackStats,
);

/**
 * @route   GET /api/feedback/admin/analytics
 * @desc    Get analytics for date range
 * @access  Protected (Admin)
 */
router.get("/admin/analytics", authenticateAdmin, getAnalytics);

/**
 * @route   GET /api/feedback/admin/export
 * @desc    Export feedback data as CSV
 * @access  Protected (Admin)
 */
router.get("/admin/export", authenticateAdmin, exportFeedback);

module.exports = router;
