import axios from "axios";

// Base API URL - change this in production
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        error: "Network error. Please check your connection.",
      });
    }

    // Handle token expiration
    if (
      error.response.status === 401 &&
      error.response.data?.code === "TOKEN_EXPIRED"
    ) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("studentData");
      window.location.href = "/login";
    }

    return Promise.reject(error.response.data);
  },
);

// ========================================
// AUTH API CALLS
// ========================================

export const authAPI = {
  // Student auth (register or login)
  studentAuth: async (data) => {
    return api.post("/auth/student", data);
  },

  // Verify if token is still valid
  verifyToken: async () => {
    return api.get("/auth/verify");
  },

  // Admin login
  adminLogin: async (credentials) => {
    return api.post("/auth/admin", credentials);
  },
};

// ========================================
// MENU API CALLS
// ========================================

export const menuAPI = {
  // Get today's menu for specific meal (with overrides applied)
  getTodaysMenu: async (mealType) => {
    return api.get(`/menu/today/${mealType}`);
  },

  // Get entire weekly menu template
  getWeeklyMenu: async () => {
    return api.get("/menu/weekly");
  },
};

// ========================================
// FEEDBACK API CALLS
// ========================================

export const feedbackAPI = {
  // Submit feedback
  submitFeedback: async (feedbackData) => {
    return api.post("/feedback", feedbackData);
  },

  // Check if already submitted today
  checkSubmission: async (date, mealType) => {
    return api.get(`/feedback/check/${date}/${mealType}`);
  },

  // Get my feedback history
  getMyFeedback: async (limit = 10, offset = 0) => {
    return api.get(`/feedback/my?limit=${limit}&offset=${offset}`);
  },
};

export default api;
