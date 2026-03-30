const express = require("express");
const router = express.Router();
const {
  getTodaysMenu,
  getWeeklyMenu,
  getMenuByDayAndMeal,
  upsertMenu,
  deleteMenu,
  copyMenu,
  addDailyOverride,
  removeDailyOverride,
  getDailyOverride,
  bulkUploadMenu,
} = require("../controllers/menuController");
const {
  authenticateStudent,
  authenticateAdmin,
} = require("../middleware/auth");
const { validate, validateMenu } = require("../utils/validation");

// ========================================
// PUBLIC/STUDENT ROUTES
// ========================================

/**
 * @route   GET /api/menu/today/:mealType
 * @desc    Get today's menu for specific meal (auto-detects overrides)
 * @access  Protected (Student)
 */
router.get("/today/:mealType", authenticateStudent, getTodaysMenu);

/**
 * @route   GET /api/menu/weekly
 * @desc    Get entire weekly menu template
 * @access  Protected (Student)
 */
router.get("/weekly", authenticateStudent, getWeeklyMenu);

// ========================================
// ADMIN ROUTES - WEEKLY MENU MANAGEMENT
// ========================================

/**
 * @route   GET /api/menu/admin/weekly
 * @desc    Get weekly menu (admin view)
 * @access  Protected (Admin)
 */
router.get("/admin/weekly", authenticateAdmin, getWeeklyMenu);

/**
 * @route   GET /api/menu/admin/:dayOfWeek/:mealType
 * @desc    Get menu for specific day and meal
 * @access  Protected (Admin)
 */
router.get(
  "/admin/:dayOfWeek/:mealType",
  authenticateAdmin,
  getMenuByDayAndMeal,
);

/**
 * @route   POST /api/menu/admin/upsert
 * @desc    Create or update menu for a day/meal
 * @access  Protected (Admin)
 */
router.post(
  "/admin/upsert",
  authenticateAdmin,
  validate(validateMenu),
  upsertMenu,
);

/**
 * @route   DELETE /api/menu/admin/:dayOfWeek/:mealType
 * @desc    Delete menu for specific day and meal
 * @access  Protected (Admin)
 */
router.delete("/admin/:dayOfWeek/:mealType", authenticateAdmin, deleteMenu);

/**
 * @route   POST /api/menu/admin/copy
 * @desc    Copy menu from one day to another
 * @access  Protected (Admin)
 */
router.post("/admin/copy", authenticateAdmin, copyMenu);

/**
 * @route   POST /api/menu/admin/bulk
 * @desc    Bulk upload entire weekly menu
 * @access  Protected (Admin)
 */
router.post("/admin/bulk", authenticateAdmin, bulkUploadMenu);

// ========================================
// ADMIN ROUTES - DAILY OVERRIDES
// ========================================

/**
 * @route   POST /api/menu/admin/override
 * @desc    Add daily override (modify today's menu)
 * @access  Protected (Admin)
 */
router.post("/admin/override", authenticateAdmin, addDailyOverride);

/**
 * @route   DELETE /api/menu/admin/override/:date/:mealType
 * @desc    Remove daily override (reset to template)
 * @access  Protected (Admin)
 */
router.delete(
  "/admin/override/:date/:mealType",
  authenticateAdmin,
  removeDailyOverride,
);

/**
 * @route   GET /api/menu/admin/override/:date
 * @desc    Get all overrides for a specific date
 * @access  Protected (Admin)
 */
router.get("/admin/override/:date", authenticateAdmin, getDailyOverride);

module.exports = router;
