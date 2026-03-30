const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config();

const { pool } = require("./config/database");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");

// Import routes
const authRoutes = require("./routes/auth");
const menuRoutes = require("./routes/menu");
const feedbackRoutes = require("./routes/feedback");

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Render/Vercel proxy (required for rate limiting to work correctly)
app.set("trust proxy", 1);

// ========================================
// SECURITY & PERFORMANCE MIDDLEWARE
// ========================================

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development, enable in production
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser (curl, Postman)
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Compression for responses
app.use(compression());

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting (general)
app.use("/api/", generalLimiter);

// ========================================
// HEALTH CHECK
// ========================================

app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Server is unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/feedback", feedbackRoutes);

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ========================================
// SERVER STARTUP
// ========================================

const server = app.listen(PORT, () => {
  console.log("");
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║   Campus Nutrition+ Backend Server           ║");
  console.log("╚═══════════════════════════════════════════════╝");
  console.log("");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Database: ${process.env.DB_NAME || "campus_nutrition"}`);
  console.log(
    `🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
  );
  console.log("");
  console.log("Available endpoints:");
  console.log("  GET  /health              - Health check");
  console.log("  POST /api/auth/student    - Student auth");
  console.log("  POST /api/auth/admin      - Admin login");
  console.log("  GET  /api/auth/verify     - Verify token");
  console.log("");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    pool.end(() => {
      console.log("Database pool closed");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    pool.end(() => {
      console.log("Database pool closed");
      process.exit(0);
    });
  });
});

module.exports = app;
