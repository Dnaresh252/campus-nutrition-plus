const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

/**
 * Generate JWT token for student
 * @param {Object} student - Student data
 * @returns {String} JWT token
 */
const generateToken = (student) => {
  const payload = {
    id: student.id,
    rollNumber: student.roll_number,
    type: "student",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: "campus-nutrition-api",
  });
};

/**
 * Generate JWT token for admin
 * @param {Object} admin - Admin data
 * @returns {String} JWT token
 */
const generateAdminToken = (admin) => {
  const payload = {
    id: admin.id,
    username: admin.username,
    type: "admin",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h", // Admins re-login daily for security
    issuer: "campus-nutrition-api",
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "campus-nutrition-api",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

module.exports = {
  generateToken,
  generateAdminToken,
  verifyToken,
};
