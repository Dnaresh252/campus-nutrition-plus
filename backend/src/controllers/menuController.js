const { query, transaction } = require("../config/database");

/**
 * Get today's menu for a specific meal
 * Automatically applies daily overrides
 */
const getTodaysMenu = async (req, res, next) => {
  try {
    const { mealType } = req.params;
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; // Sunday = 7, Monday = 1
    const dateStr = today.toLocaleDateString("en-CA", {
      timeZone: process.env.TZ || "Asia/Kolkata",
    });

    // Get template menu for this day and meal
    const templateResult = await query(
      "SELECT dishes FROM weekly_menu WHERE day_of_week = $1 AND meal_type = $2",
      [dayOfWeek, mealType.toUpperCase()],
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Menu not found for this day and meal",
      });
    }

    let menu = templateResult.rows[0].dishes;

    // Check for daily overrides
    const overrideResult = await query(
      "SELECT removed_dishes, added_dishes FROM daily_overrides WHERE date = $1 AND meal_type = $2",
      [dateStr, mealType.toUpperCase()],
    );

    if (overrideResult.rows.length > 0) {
      const override = overrideResult.rows[0];

      // Remove dishes
      if (override.removed_dishes && override.removed_dishes.length > 0) {
        menu = menu.filter(
          (dish) => !override.removed_dishes.includes(dish.id),
        );
      }

      // Add dishes
      if (override.added_dishes && override.added_dishes.length > 0) {
        menu = [...menu, ...override.added_dishes];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        date: dateStr,
        dayOfWeek,
        mealType: mealType.toUpperCase(),
        menu,
        hasOverride: overrideResult.rows.length > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get entire weekly menu template
 */
const getWeeklyMenu = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT day_of_week, meal_type, dishes, created_at, updated_at 
       FROM weekly_menu 
       ORDER BY day_of_week, 
       CASE meal_type 
         WHEN 'BREAKFAST' THEN 1 
         WHEN 'LUNCH' THEN 2 
         WHEN 'SNACKS' THEN 3 
         WHEN 'DINNER' THEN 4 
       END`,
    );

    // Group by day
    const weeklyMenu = {
      1: { day: "Monday", meals: {} },
      2: { day: "Tuesday", meals: {} },
      3: { day: "Wednesday", meals: {} },
      4: { day: "Thursday", meals: {} },
      5: { day: "Friday", meals: {} },
      6: { day: "Saturday", meals: {} },
      7: { day: "Sunday", meals: {} },
    };

    result.rows.forEach((row) => {
      weeklyMenu[row.day_of_week].meals[row.meal_type] = {
        dishes: row.dishes,
        updatedAt: row.updated_at,
      };
    });

    res.status(200).json({
      success: true,
      data: weeklyMenu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get menu for specific day and meal
 */
const getMenuByDayAndMeal = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType } = req.params;

    const result = await query(
      "SELECT * FROM weekly_menu WHERE day_of_week = $1 AND meal_type = $2",
      [dayOfWeek, mealType.toUpperCase()],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Menu not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update menu for a day and meal
 * ADMIN ONLY
 */
const upsertMenu = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, dishes } = req.validatedData;
    const adminId = req.admin.id;

    const result = await query(
      `INSERT INTO weekly_menu (day_of_week, meal_type, dishes, created_by) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (day_of_week, meal_type) 
       DO UPDATE SET 
         dishes = $3,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [dayOfWeek, mealType, JSON.stringify(dishes), adminId],
    );

    res.status(200).json({
      success: true,
      message: "Menu saved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete menu for a specific day and meal
 * ADMIN ONLY
 */
const deleteMenu = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType } = req.params;

    const result = await query(
      "DELETE FROM weekly_menu WHERE day_of_week = $1 AND meal_type = $2 RETURNING *",
      [dayOfWeek, mealType.toUpperCase()],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Menu not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Copy menu from one day to another
 * ADMIN ONLY
 */
const copyMenu = async (req, res, next) => {
  try {
    const { fromDay, toDay, mealType } = req.body;
    const adminId = req.admin.id;

    if (!fromDay || !toDay || !mealType) {
      return res.status(400).json({
        success: false,
        error: "fromDay, toDay, and mealType are required",
      });
    }

    // Get source menu
    const sourceResult = await query(
      "SELECT dishes FROM weekly_menu WHERE day_of_week = $1 AND meal_type = $2",
      [fromDay, mealType.toUpperCase()],
    );

    if (sourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Source menu not found",
      });
    }

    const dishes = sourceResult.rows[0].dishes;

    // Copy to destination
    const result = await query(
      `INSERT INTO weekly_menu (day_of_week, meal_type, dishes, created_by) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (day_of_week, meal_type) 
       DO UPDATE SET 
         dishes = $3,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [toDay, mealType.toUpperCase(), JSON.stringify(dishes), adminId],
    );

    res.status(200).json({
      success: true,
      message: `Menu copied from day ${fromDay} to day ${toDay}`,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add daily override (modify today's menu)
 * ADMIN ONLY
 */
const addDailyOverride = async (req, res, next) => {
  try {
    const { date, mealType, removedDishes, addedDishes } = req.body;
    const adminId = req.admin.id;

    if (!date || !mealType) {
      return res.status(400).json({
        success: false,
        error: "date and mealType are required",
      });
    }

    const result = await query(
      `INSERT INTO daily_overrides (date, meal_type, removed_dishes, added_dishes, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (date, meal_type)
       DO UPDATE SET
         removed_dishes = $3,
         added_dishes = $4,
         created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        date,
        mealType.toUpperCase(),
        removedDishes || [],
        JSON.stringify(addedDishes || []),
        adminId,
      ],
    );

    res.status(200).json({
      success: true,
      message: "Daily override added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove daily override (reset to template)
 * ADMIN ONLY
 */
const removeDailyOverride = async (req, res, next) => {
  try {
    const { date, mealType } = req.params;

    const result = await query(
      "DELETE FROM daily_overrides WHERE date = $1 AND meal_type = $2 RETURNING *",
      [date, mealType.toUpperCase()],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No override found for this date and meal",
      });
    }

    res.status(200).json({
      success: true,
      message: "Override removed. Menu reset to template.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get daily override for a specific date
 * ADMIN ONLY
 */
const getDailyOverride = async (req, res, next) => {
  try {
    const { date } = req.params;

    const result = await query(
      "SELECT * FROM daily_overrides WHERE date = $1 ORDER BY meal_type",
      [date],
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk upload weekly menu (for initial setup)
 * ADMIN ONLY
 */
const bulkUploadMenu = async (req, res, next) => {
  try {
    const { weeklyMenu } = req.body;
    const adminId = req.admin.id;

    if (!weeklyMenu || typeof weeklyMenu !== "object") {
      return res.status(400).json({
        success: false,
        error: "weeklyMenu object is required",
      });
    }

    await transaction(async (client) => {
      for (const [dayOfWeek, meals] of Object.entries(weeklyMenu)) {
        for (const [mealType, dishes] of Object.entries(meals)) {
          await client.query(
            `INSERT INTO weekly_menu (day_of_week, meal_type, dishes, created_by)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (day_of_week, meal_type)
             DO UPDATE SET
               dishes = $3,
               updated_at = CURRENT_TIMESTAMP`,
            [
              parseInt(dayOfWeek),
              mealType.toUpperCase(),
              JSON.stringify(dishes),
              adminId,
            ],
          );
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Weekly menu uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
