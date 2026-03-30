/**
 * Save authentication token to localStorage
 */
export const saveToken = (token) => {
  localStorage.setItem("authToken", token);
};

/**
 * Get authentication token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("studentData");
};

/**
 * Save student data to localStorage
 */
export const saveStudentData = (studentData) => {
  localStorage.setItem("studentData", JSON.stringify(studentData));
};

/**
 * Get student data from localStorage
 */
export const getStudentData = () => {
  const data = localStorage.getItem("studentData");
  return data ? JSON.parse(data) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  const studentData = getStudentData();
  return !!(token && studentData);
};

/**
 * Logout user
 */
export const logout = () => {
  removeToken();
  window.location.href = "/login";
};

/**
 * Validate roll number format
 */
export const validateRollNumber = (rollNumber) => {
  // Accept any alphanumeric roll number between 5 and 15 characters
  const regex = /^[A-Z0-9]{5,15}$/;
  return regex.test(rollNumber);
};
