import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";
import {
  getToken,
  saveToken,
  removeToken,
  getStudentData,
  saveStudentData,
  isAuthenticated as checkAuth,
} from "../utils/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
  const [student, setStudent] = useState(getStudentData());
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authAPI.verifyToken();
        if (response.success) {
          setIsAuthenticated(true);
          setStudent(response.data.user);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  /**
   * Student login/register
   */
  const handleAuth = async (rollNumber, name, hostel, room) => {
    try {
      const response = await authAPI.studentAuth({
        rollNumber,
        name,
        hostel,
        room,
      });

      if (response.success) {
        const { token, student } = response.data;

        // Save to localStorage
        saveToken(token);
        saveStudentData(student);

        // Update state
        setIsAuthenticated(true);
        setStudent(student);

        return { success: true, message: response.message };
      }

      return { success: false, error: "Authentication failed" };
    } catch (error) {
      console.error("Auth error:", error);
      return {
        success: false,
        error: error.error || "Authentication failed. Please try again.",
      };
    }
  };

  /**
   * Logout
   */
  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    setStudent(null);
  };

  const value = {
    isAuthenticated,
    student,
    isLoading,
    login: handleAuth,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
