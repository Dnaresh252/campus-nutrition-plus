// Professional Mock Data for Indian University Hostel Menu
// Clean, structured data - no emojis, production-ready

export const MEAL_TIMINGS = {
  BREAKFAST: {
    start: "07:00",
    end: "11:00",
    name: "Breakfast",
    displayTime: "7:00 AM - 9:30 AM",
  },
  LUNCH: {
    start: "11:00",
    end: "17:00",
    name: "Lunch",
    displayTime: "11:00 AM - 5:00 PM",
  },
  SNACKS: {
    start: "16:00",
    end: "17:30",
    name: "Snacks",
    displayTime: "4:00 PM - 5:30 PM",
  },
  DINNER: {
    start: "19:30",
    end: "22:00",
    name: "Dinner",
    displayTime: "7:30 PM - 10:00 PM",
  },
};

// Today's Menu - Professional structure
export const TODAYS_MENU = {
  date: new Date().toISOString().split("T")[0],
  day: new Date().toLocaleDateString("en-US", { weekday: "long" }),

  BREAKFAST: [
    { id: "b1", name: "Poha", category: "Main Course" },
    { id: "b2", name: "Sambar", category: "Curry" },
    { id: "b3", name: "Idli (4 pcs)", category: "Main Course" },
    { id: "b4", name: "Coconut Chutney", category: "Side Dish" },
    { id: "b5", name: "Tea/Coffee", category: "Beverage" },
    { id: "b6", name: "Banana", category: "Fruit" },
  ],

  LUNCH: [
    { id: "l1", name: "Steamed Rice", category: "Main Course" },
    { id: "l2", name: "Dal Tadka", category: "Curry" },
    { id: "l3", name: "Mixed Vegetable Curry", category: "Curry" },
    { id: "l4", name: "Roti/Chapati (4 pcs)", category: "Bread" },
    { id: "l5", name: "Curd", category: "Side Dish" },
    { id: "l6", name: "Pickle", category: "Accompaniment" },
    { id: "l7", name: "Papad (2 pcs)", category: "Accompaniment" },
  ],

  SNACKS: [
    { id: "s1", name: "Samosa (2 pcs)", category: "Snack" },
    { id: "s2", name: "Tea/Coffee", category: "Beverage" },
    { id: "s3", name: "Marie Biscuits", category: "Snack" },
  ],

  DINNER: [
    { id: "d1", name: "Jeera Rice", category: "Main Course" },
    { id: "d2", name: "Rajma Masala", category: "Curry" },
    { id: "d3", name: "Chapati (4 pcs)", category: "Bread" },
    { id: "d4", name: "Green Salad", category: "Side Dish" },
    { id: "d5", name: "Raita", category: "Side Dish" },
    { id: "d6", name: "Gulab Jamun (2 pcs)", category: "Dessert" },
  ],
};

// Professional rating scale (1-5 stars)
export const RATING_SCALE = [
  { value: 5, label: "Excellent" },
  { value: 4, label: "Good" },
  { value: 3, label: "Average" },
  { value: 2, label: "Below Average" },
  { value: 1, label: "Poor" },
];

// Wastage levels for tracking
export const WASTAGE_LEVELS = {
  NONE: { value: 0, label: "No Wastage" },
  LOW: { value: 25, label: "Minimal (1/4 plate)" },
  MEDIUM: { value: 50, label: "Moderate (1/2 plate)" },
  HIGH: { value: 75, label: "Significant (3/4 plate)" },
  FULL: { value: 100, label: "Complete Wastage" },
};

// Sample student data (would come from authentication)
export const MOCK_STUDENT = {
  rollNumber: "22P31A05B1",
  name: "Palli Vykuntarao",
  hostel: "Boys Hostel A",
  room: "204",
  batch: "B.Tech CSE 2022-26",
};
