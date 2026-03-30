const bcrypt = require("bcrypt");
const { query } = require("../config/database");
const { generateToken, generateAdminToken } = require("../utils/jwt");

/**
 * Student Registration / Login
 * If student exists → login, else → register
 */
const studentAuth = async (req, res, next) => {
  try {
    const { rollNumber, name, hostel, room } = req.validatedData;

    // Check if student exists
    const checkStudent = await query(
      "SELECT * FROM students WHERE roll_number = $1",
      [rollNumber],
    );

    let student;

    if (checkStudent.rows.length > 0) {
      // Student exists → login
      student = checkStudent.rows[0];

      // Update last login
      await query(
        "UPDATE students SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
        [student.id],
      );
    } else {
      // New student → register
      const newStudent = await query(
        `INSERT INTO students (roll_number, name, hostel, room) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [rollNumber, name, hostel, room || null],
      );

      student = newStudent.rows[0];
    }

    // Generate JWT token
    const token = generateToken(student);

    res.status(200).json({
      success: true,
      message:
        checkStudent.rows.length > 0
          ? "Login successful"
          : "Registration successful",
      data: {
        token,
        student: {
          id: student.id,
          rollNumber: student.roll_number,
          name: student.name,
          hostel: student.hostel,
          room: student.room,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Login
 */
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    // Find admin
    const result = await query("SELECT * FROM admins WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const admin = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Update last login
    await query(
      "UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [admin.id],
    );

    // Generate token
    const token = generateAdminToken(admin);

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Token (check if user is still authenticated)
 */
const verifyAuth = async (req, res) => {
  // If middleware passed, user is authenticated
  res.status(200).json({
    success: true,
    message: "Token is valid",
    data: {
      user: req.student || req.admin,
      type: req.student ? "student" : "admin",
    },
  });
};

module.exports = {
  studentAuth,
  adminLogin,
  verifyAuth,
};
