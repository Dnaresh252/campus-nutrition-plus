const { verifyToken } = require("../utils/jwt");

/**
 * Middleware to authenticate students
 */
const authenticateStudent = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided. Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = verifyToken(token);

    // Check if it's a student token
    if (decoded.type !== "student") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Student authentication required.",
      });
    }

    // Attach student info to request
    req.student = {
      id: decoded.id,
      rollNumber: decoded.rollNumber,
    };

    next();
  } catch (error) {
    if (error.message === "Token expired") {
      return res.status(401).json({
        success: false,
        error: "Session expired. Please login again.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid token. Please login again.",
    });
  }
};

/**
 * Middleware to authenticate admins
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Admin authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Check if it's an admin token
    if (decoded.type !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    req.admin = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error) {
    if (error.message === "Token expired") {
      return res.status(401).json({
        success: false,
        error: "Admin session expired. Please login again.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      error: "Invalid admin token",
    });
  }
};

module.exports = {
  authenticateStudent,
  authenticateAdmin,
};
