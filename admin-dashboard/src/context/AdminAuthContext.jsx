import { createContext, useContext, useState, useEffect } from "react";
import { adminAuthAPI } from "../utils/adminApi";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await adminAuthAPI.verify();
        if (response.success) {
          setIsAuthenticated(true);
          setAdmin(response.data.user);
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

  const handleLogin = async (username, password) => {
    try {
      const response = await adminAuthAPI.login({ username, password });

      if (response.success) {
        const { token, admin } = response.data;

        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminData", JSON.stringify(admin));

        setIsAuthenticated(true);
        setAdmin(admin);

        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error) {
      return {
        success: false,
        error: error.error || "Login failed. Please try again.",
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setIsAuthenticated(false);
    setAdmin(null);
  };

  const value = {
    isAuthenticated,
    admin,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};

export default AdminAuthContext;
