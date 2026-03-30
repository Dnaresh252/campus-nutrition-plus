import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance for admin
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds for admin operations
});

// Request interceptor - add admin token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors
adminApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        success: false,
        error: "Network error. Check your connection.",
      });
    }

    // Handle token expiration
    if (error.response.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      window.location.href = "/admin/login";
    }

    return Promise.reject(error.response.data);
  },
);

// ========================================
// ADMIN AUTH
// ========================================

export const adminAuthAPI = {
  login: async (credentials) => {
    return adminApi.post("/auth/admin", credentials);
  },

  verify: async () => {
    return adminApi.get("/auth/admin/verify");
  },
};

// ========================================
// MENU MANAGEMENT
// ========================================

export const adminMenuAPI = {
  // Get weekly menu template
  getWeeklyMenu: async () => {
    return adminApi.get("/menu/admin/weekly");
  },

  // Get specific day/meal menu
  getMenu: async (dayOfWeek, mealType) => {
    return adminApi.get(`/menu/admin/${dayOfWeek}/${mealType}`);
  },

  // Create or update menu
  upsertMenu: async (menuData) => {
    return adminApi.post("/menu/admin/upsert", menuData);
  },

  // Delete menu
  deleteMenu: async (dayOfWeek, mealType) => {
    return adminApi.delete(`/menu/admin/${dayOfWeek}/${mealType}`);
  },

  // Copy menu from one day to another
  copyMenu: async (fromDay, toDay, mealType) => {
    return adminApi.post("/menu/admin/copy", { fromDay, toDay, mealType });
  },

  // Bulk upload entire weekly menu
  bulkUpload: async (weeklyMenu) => {
    return adminApi.post("/menu/admin/bulk", { weeklyMenu });
  },

  // Get daily overrides for a date
  getDailyOverride: async (date) => {
    return adminApi.get(`/menu/admin/override/${date}`);
  },

  // Add daily override
  addDailyOverride: async (overrideData) => {
    return adminApi.post("/menu/admin/override", overrideData);
  },

  // Remove daily override
  removeDailyOverride: async (date, mealType) => {
    return adminApi.delete(`/menu/admin/override/${date}/${mealType}`);
  },
};

// ========================================
// FEEDBACK & ANALYTICS
// ========================================

export const adminFeedbackAPI = {
  // Get live feedback stats for today
  getLiveStats: async (date, mealType) => {
    return adminApi.get(`/feedback/admin/live/${date}/${mealType}`);
  },

  // Get analytics for date range
  getAnalytics: async (startDate, endDate) => {
    return adminApi.get(
      `/feedback/admin/analytics?startDate=${startDate}&endDate=${endDate}`,
    );
  },

  // Export feedback as CSV
  exportCSV: async (startDate, endDate) => {
    const response = await axios.get(
      `${API_BASE_URL}/feedback/admin/export?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        responseType: "blob", // Important for file download
      },
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `feedback_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true };
  },
};

// ========================================
// STUDENT MANAGEMENT (Bonus)
// ========================================

export const adminStudentAPI = {
  // Get all students
  getAllStudents: async (limit = 50, offset = 0) => {
    return adminApi.get(`/admin/students?limit=${limit}&offset=${offset}`);
  },

  // Search students
  searchStudents: async (query) => {
    return adminApi.get(`/admin/students/search?q=${query}`);
  },
};

export default adminApi;
