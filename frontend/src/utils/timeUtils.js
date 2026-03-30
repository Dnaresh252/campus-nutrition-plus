// Utility functions for time-based meal detection and validation

import { MEAL_TIMINGS } from "../data/mockData";

/**
 * Get current time in HH:MM format
 */
export const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

/**
 * Convert time string to minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Detect current meal slot based on time
 * Returns: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER' | null
 */
export const detectCurrentMeal = () => {
  const currentTime = getCurrentTime();
  const currentMinutes = timeToMinutes(currentTime);

  for (const [mealType, timing] of Object.entries(MEAL_TIMINGS)) {
    const startMinutes = timeToMinutes(timing.start);
    const endMinutes = timeToMinutes(timing.end);

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return mealType;
    }
  }

  return null; // No active meal slot
};

/**
 * Check if feedback can be submitted for a meal
 * Grace period: 30 minutes after meal end time
 */
export const canSubmitFeedback = (mealType) => {
  if (!mealType) return false;

  const currentTime = getCurrentTime();
  const currentMinutes = timeToMinutes(currentTime);
  const timing = MEAL_TIMINGS[mealType];

  if (!timing) return false;

  const endMinutes = timeToMinutes(timing.end);
  const graceMinutes = 30; // 30 min grace period

  return currentMinutes <= endMinutes + graceMinutes;
};

/**
 * Get meal display name
 */
export const getMealName = (mealType) => {
  return MEAL_TIMINGS[mealType]?.name || "Unknown Meal";
};

/**
 * Get meal timing display
 */
export const getMealTiming = (mealType) => {
  const timing = MEAL_TIMINGS[mealType];
  if (!timing) return "";
  return `${timing.start} - ${timing.end}`;
};

/**
 * Get time remaining for current meal slot
 */
export const getTimeRemaining = (mealType) => {
  const timing = MEAL_TIMINGS[mealType];
  if (!timing) return "";

  const currentTime = getCurrentTime();
  const currentMinutes = timeToMinutes(currentTime);
  const endMinutes = timeToMinutes(timing.end);

  const remainingMinutes = endMinutes - currentMinutes;

  if (remainingMinutes <= 0) return "Ended";
  if (remainingMinutes < 60) return `${remainingMinutes} min left`;

  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;
  return `${hours}h ${mins}m left`;
};

/**
 * Format date for display
 */
export const formatDate = (date = new Date()) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Validate roll number format
 */
export const validateRollNumber = (rollNumber) => {
  // Format: 22P31A05B1 (example from your team)
  const regex = /^\d{2}[A-Z]\d{2}[A-Z]\d{2}[A-Z]\d$/;
  return regex.test(rollNumber);
};

/**
 * Check if feedback already submitted today for this meal
 * In real app, this would check backend
 */
export const hasSubmittedToday = (rollNumber, mealType) => {
  const today = new Date().toDateString();
  const storageKey = `feedback_${rollNumber}_${mealType}_${today}`;
  return localStorage.getItem(storageKey) !== null;
};

/**
 * Mark feedback as submitted
 */
export const markAsSubmitted = (rollNumber, mealType) => {
  const today = new Date().toDateString();
  const storageKey = `feedback_${rollNumber}_${mealType}_${today}`;
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      submitted: true,
      timestamp: new Date().toISOString(),
    }),
  );
};

/**
 * Get emoji for rating
 */
export const getRatingEmoji = (rating) => {
  const emojis = {
    5: "😋",
    4: "😊",
    3: "😐",
    2: "😕",
    1: "😞",
  };
  return emojis[rating] || "😐";
};

/**
 * Calculate average rating
 */
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, val) => acc + val, 0);
  return (sum / ratings.length).toFixed(1);
};
