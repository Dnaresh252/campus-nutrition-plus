const { query } = require("../config/database");

/**
 * Call AI API in background after feedback is saved
 * Non-blocking — student response is never delayed by this
 */
const analyzeWithAI = async (feedbackId, comment, mealType) => {
  const aiUrl = process.env.AI_API_URL;
  if (!aiUrl) return;

  const response = await fetch(`${aiUrl}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment, meal_type: mealType }),
    signal: AbortSignal.timeout(15000), // 15s timeout
  });

  if (!response.ok) return;

  const data = await response.json();
  if (!data.success) return;

  await query("UPDATE feedback SET ai_analysis = $1 WHERE id = $2", [
    JSON.stringify(data.data),
    feedbackId,
  ]);
};

/**
 * Submit feedback
 * STUDENT ONLY
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { mealType, ratings, wastage, comments } = req.validatedData;
    const studentId = req.student.id;
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: process.env.TZ || "Asia/Kolkata",
    });

    // Check if already submitted for this meal today
    const checkResult = await query(
      `SELECT id FROM feedback 
       WHERE student_id = $1 AND submission_date = $2 AND meal_type = $3`,
      [studentId, today, mealType],
    );

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "You have already submitted feedback for this meal today",
      });
    }

    // Insert feedback
    const result = await query(
      `INSERT INTO feedback (student_id, submission_date, meal_type, ratings, wastage, comments)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, submission_date, meal_type, submitted_at`,
      [
        studentId,
        today,
        mealType,
        JSON.stringify(ratings),
        wastage,
        comments || null,
      ],
    );

    const row = result.rows[0];

    // Fire-and-forget AI analysis — student doesn't wait for this
    if (comments) {
      analyzeWithAI(row.id, comments, mealType).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: {
        ...row,
        submission_date: today,
      },
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "Feedback already submitted for this meal",
      });
    }
    next(error);
  }
};

/**
 * Check if student already submitted feedback for a specific date and meal
 * STUDENT ONLY
 */
const checkSubmission = async (req, res, next) => {
  try {
    const { date, mealType } = req.params;
    const studentId = req.student.id;

    const result = await query(
      `SELECT id, submitted_at FROM feedback 
       WHERE student_id = $1 AND submission_date = $2 AND meal_type = $3`,
      [studentId, date, mealType.toUpperCase()],
    );

    res.status(200).json({
      success: true,
      data: {
        hasSubmitted: result.rows.length > 0,
        submittedAt: result.rows[0]?.submitted_at || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's feedback history
 * STUDENT ONLY
 */
const getMyFeedback = async (req, res, next) => {
  try {
    const studentId = req.student.id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    const result = await query(
      `SELECT submission_date, meal_type, ratings, wastage, comments, submitted_at
       FROM feedback
       WHERE student_id = $1
       ORDER BY submission_date DESC, submitted_at DESC
       LIMIT $2 OFFSET $3`,
      [studentId, limit, offset],
    );

    const countResult = await query(
      "SELECT COUNT(*) as total FROM feedback WHERE student_id = $1",
      [studentId],
    );

    res.status(200).json({
      success: true,
      data: {
        feedback: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get live feedback stats for current meal
 * ADMIN ONLY
 */
const getLiveFeedbackStats = async (req, res, next) => {
  try {
    const { date, mealType } = req.params;

    // Get submission count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM feedback 
       WHERE submission_date = $1 AND meal_type = $2`,
      [date, mealType.toUpperCase()],
    );

    // Get average rating and wastage
    const avgResult = await query(
      `SELECT 
         AVG(wastage) as avg_wastage,
         COUNT(*) as total_submissions
       FROM feedback
       WHERE submission_date = $1 AND meal_type = $2`,
      [date, mealType.toUpperCase()],
    );

    // Get all ratings to calculate dish-wise averages
    const ratingsResult = await query(
      `SELECT ratings FROM feedback
       WHERE submission_date = $1 AND meal_type = $2`,
      [date, mealType.toUpperCase()],
    );

    // Calculate dish-wise averages
    const dishRatings = {};
    ratingsResult.rows.forEach((row) => {
      const ratings = row.ratings;
      Object.entries(ratings).forEach(([dishId, rating]) => {
        if (!dishRatings[dishId]) {
          dishRatings[dishId] = { sum: 0, count: 0 };
        }
        dishRatings[dishId].sum += rating;
        dishRatings[dishId].count += 1;
      });
    });

    const dishAverages = Object.entries(dishRatings).map(([dishId, data]) => ({
      dishId,
      averageRating: (data.sum / data.count).toFixed(2),
      totalRatings: data.count,
    }));

    // Get recent comments with AI analysis
    const commentsResult = await query(
      `SELECT comments, submitted_at, ai_analysis FROM feedback
       WHERE submission_date = $1 AND meal_type = $2 AND comments IS NOT NULL
       ORDER BY submitted_at DESC
       LIMIT 10`,
      [date, mealType.toUpperCase()],
    );

    res.status(200).json({
      success: true,
      data: {
        date,
        mealType: mealType.toUpperCase(),
        totalSubmissions: parseInt(countResult.rows[0].total),
        averageWastage: parseFloat(avgResult.rows[0].avg_wastage || 0).toFixed(
          2,
        ),
        dishAverages: dishAverages.sort(
          (a, b) => b.averageRating - a.averageRating,
        ),
        recentComments: commentsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics for a date range
 * ADMIN ONLY
 */
const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "startDate and endDate are required",
      });
    }

    // Daily breakdown
    const dailyResult = await query(
      `SELECT 
         submission_date,
         meal_type,
         COUNT(*) as total_submissions,
         AVG(wastage) as avg_wastage,
         COUNT(DISTINCT student_id) as unique_students
       FROM feedback
       WHERE submission_date BETWEEN $1 AND $2
       GROUP BY submission_date, meal_type
       ORDER BY submission_date, meal_type`,
      [startDate, endDate],
    );

    // Get all ratings for dish analysis
    const ratingsResult = await query(
      `SELECT ratings FROM feedback
       WHERE submission_date BETWEEN $1 AND $2`,
      [startDate, endDate],
    );

    // Calculate overall dish averages
    const dishRatings = {};
    ratingsResult.rows.forEach((row) => {
      const ratings = row.ratings;
      Object.entries(ratings).forEach(([dishId, rating]) => {
        if (!dishRatings[dishId]) {
          dishRatings[dishId] = { sum: 0, count: 0, ratings: [] };
        }
        dishRatings[dishId].sum += rating;
        dishRatings[dishId].count += 1;
        dishRatings[dishId].ratings.push(rating);
      });
    });

    const dishAnalytics = Object.entries(dishRatings).map(([dishId, data]) => ({
      dishId,
      averageRating: (data.sum / data.count).toFixed(2),
      totalRatings: data.count,
      ratingDistribution: {
        5: data.ratings.filter((r) => r === 5).length,
        4: data.ratings.filter((r) => r === 4).length,
        3: data.ratings.filter((r) => r === 3).length,
        2: data.ratings.filter((r) => r === 2).length,
        1: data.ratings.filter((r) => r === 1).length,
      },
    }));

    // Top and bottom dishes
    const topDishes = dishAnalytics
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    const bottomDishes = dishAnalytics
      .sort((a, b) => a.averageRating - b.averageRating)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        dateRange: { startDate, endDate },
        dailyBreakdown: dailyResult.rows,
        dishAnalytics: {
          all: dishAnalytics.sort((a, b) => b.averageRating - a.averageRating),
          topRated: topDishes,
          needsImprovement: bottomDishes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export feedback data as CSV
 * ADMIN ONLY
 */
const exportFeedback = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "startDate and endDate are required",
      });
    }

    const result = await query(
      `SELECT 
         f.id,
         s.roll_number,
         s.name,
         s.hostel,
         f.submission_date,
         f.meal_type,
         f.ratings,
         f.wastage,
         f.comments,
         f.submitted_at
       FROM feedback f
       JOIN students s ON f.student_id = s.id
       WHERE f.submission_date BETWEEN $1 AND $2
       ORDER BY f.submission_date DESC, f.submitted_at DESC`,
      [startDate, endDate],
    );

    // Convert to CSV
    const headers = [
      "ID",
      "Roll Number",
      "Student Name",
      "Hostel",
      "Date",
      "Meal Type",
      "Ratings",
      "Wastage %",
      "Comments",
      "Submitted At",
    ];

    const csvRows = [headers.join(",")];

    result.rows.forEach((row) => {
      const values = [
        row.id,
        row.roll_number,
        `"${row.name}"`,
        `"${row.hostel}"`,
        row.submission_date,
        row.meal_type,
        `"${JSON.stringify(row.ratings)}"`,
        row.wastage,
        `"${(row.comments || "").replace(/"/g, '""')}"`,
        row.submitted_at,
      ];
      csvRows.push(values.join(","));
    });

    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=feedback_${startDate}_to_${endDate}.csv`,
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  checkSubmission,
  getMyFeedback,
  getLiveFeedbackStats,
  getAnalytics,
  exportFeedback,
};
