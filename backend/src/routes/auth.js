const express = require("express");
const router = express.Router();
const {
  studentAuth,
  adminLogin,
  verifyAuth,
} = require("../controllers/authController");
const {
  validate,
  validateStudentRegistration,
} = require("../utils/validation");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  authenticateStudent,
  authenticateAdmin,
} = require("../middleware/auth");

/**
 * @route   POST /api/auth/student
 * @desc    Student registration/login
 * @access  Public
 */
router.post(
  "/student",
  authLimiter,
  validate(validateStudentRegistration),
  studentAuth,
);

/**
 * @route   POST /api/auth/admin
 * @desc    Admin login
 * @access  Public
 */
router.post("/admin", authLimiter, adminLogin);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify if token is valid
 * @access  Protected
 */
router.get("/verify", authenticateStudent, verifyAuth);

/**
 * @route   GET /api/auth/admin/verify
 * @desc    Verify admin token
 * @access  Protected (Admin)
 */
router.get("/admin/verify", authenticateAdmin, verifyAuth);

module.exports = router;
