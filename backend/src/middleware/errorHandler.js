/**
 * Global error handler middleware
 * Catches all errors and returns consistent responses
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Database errors
  if (err.code === "23505") {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      error: "This record already exists",
    });
  }

  if (err.code === "23503") {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      error: "Invalid reference. Related record not found.",
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid authentication token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Authentication token expired",
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 handler for undefined routes
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
};

module.exports = {
  errorHandler,
  notFound,
};
