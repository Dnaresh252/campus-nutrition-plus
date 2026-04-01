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

router.get("/today/:mealType", authenticateStudent, getTodaysMenu);
router.get("/weekly", authenticateStudent, getWeeklyMenu);

// ========================================
// ADMIN ROUTES
// NOTE: Specific/literal routes MUST come before parameterized routes
// to prevent Express matching e.g. /admin/override/date as /:dayOfWeek/:mealType
// ========================================

// -- Specific routes first --
router.get("/admin/weekly", authenticateAdmin, getWeeklyMenu);
router.post("/admin/upsert", authenticateAdmin, validate(validateMenu), upsertMenu);
router.post("/admin/copy", authenticateAdmin, copyMenu);
router.post("/admin/bulk", authenticateAdmin, bulkUploadMenu);

// -- Override routes (must be before /:dayOfWeek/:mealType) --
router.post("/admin/override", authenticateAdmin, addDailyOverride);
router.get("/admin/override/:date", authenticateAdmin, getDailyOverride);
router.delete("/admin/override/:date/:mealType", authenticateAdmin, removeDailyOverride);

// -- Parameterized routes last --
router.get("/admin/:dayOfWeek/:mealType", authenticateAdmin, getMenuByDayAndMeal);
router.delete("/admin/:dayOfWeek/:mealType", authenticateAdmin, deleteMenu);

module.exports = router;
