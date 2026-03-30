import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Send,
  LogOut,
} from "lucide-react";
import DishRatingCard from "../components/DishRatingCard";
import WastageSlider from "../components/WastageSlider";
import { useAuth } from "../context/AuthContext";
import { menuAPI, feedbackAPI } from "../utils/api";
import FoodQualityDetector from "../components/FoodQualityDetector";
import {
  detectCurrentMeal,
  canSubmitFeedback,
  getMealTiming,
  formatDate,
} from "../utils/timeUtils";

const FeedbackForm = () => {
  const { student, logout } = useAuth();
  const [currentMeal, setCurrentMeal] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [ratings, setRatings] = useState({});
  const [wastage, setWastage] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      const meal = detectCurrentMeal();
      setCurrentMeal(meal);

      if (!meal) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if already submitted
        const today = new Date().toISOString().split("T")[0];
        const checkResponse = await feedbackAPI.checkSubmission(today, meal);

        if (checkResponse.success && checkResponse.data.hasSubmitted) {
          setAlreadySubmitted(true);
          setIsLoading(false);
          return;
        }

        // Fetch today's menu
        const menuResponse = await menuAPI.getTodaysMenu(meal);

        if (menuResponse.success) {
          setMenuItems(menuResponse.data.menu);
        }
      } catch (error) {
        console.error("Error loading menu:", error);
        setError(error.error || "Failed to load menu. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
  }, []);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleAIAnalysis = (analysis) => {
    setAiAnalysis(analysis);
    // You can pre-fill ratings based on quality score if you want
  };
  const handleRatingChange = (dishId, rating) => {
    setRatings((prev) => ({
      ...prev,
      [dishId]: rating,
    }));
    setError("");
  };

  const validateForm = () => {
    const hasRatings = Object.keys(ratings).length > 0;
    if (!hasRatings) {
      setError("Please rate at least one dish");
      return false;
    }

    if (!canSubmitFeedback(currentMeal)) {
      setError("Feedback submission time has expired");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await feedbackAPI.submitFeedback({
        mealType: currentMeal,
        ratings,
        wastage,
        comments: comments.trim() || null,
      });

      if (response.success) {
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          setAlreadySubmitted(true);
        }, 3000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.error || "Failed to submit feedback. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  // No active meal slot
  if (!currentMeal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-neutral-50 to-neutral-100">
        <div className="mobile-card-lg max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock size={40} className="text-neutral-600" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            No Active Meal
          </h2>
          <p className="text-neutral-600 mb-6 leading-relaxed">
            Feedback can only be submitted during meal hours
          </p>
          <div className="bg-primary-50 rounded-xl p-5 text-left">
            <p className="font-bold text-primary-900 mb-4 text-sm">
              Meal Timings:
            </p>
            <div className="space-y-3">
              {[
                "Breakfast: 7:00 AM - 9:30 AM",
                "Lunch: 12:00 PM - 2:30 PM",
                "Snacks: 4:00 PM - 5:30 PM",
                "Dinner: 7:30 PM - 10:00 PM",
              ].map((timing, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-sm text-primary-800 font-medium">
                    {timing}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-6 mobile-btn-secondary flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // Already submitted
  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-success-50 to-success-100">
        <div className="mobile-card-lg max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-slide-up-mobile">
            <CheckCircle
              size={48}
              className="text-success-600"
              strokeWidth={2.5}
            />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            Already Submitted!
          </h2>
          <p className="text-neutral-600 mb-2 text-lg">
            You've submitted feedback for{" "}
            <span className="font-bold text-neutral-900">
              {currentMeal.toLowerCase()}
            </span>{" "}
            today.
          </p>
          <p className="text-sm text-neutral-500 mt-6 bg-neutral-50 p-4 rounded-xl">
            You can submit new feedback for the next meal
          </p>
          <button
            onClick={logout}
            className="mt-6 mobile-btn-secondary flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-success-50 to-success-100 animate-fade-in-mobile">
        <div className="mobile-card-lg max-w-sm w-full text-center">
          <div className="w-28 h-28 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-slide-up-mobile">
            <CheckCircle
              size={56}
              className="text-success-600"
              strokeWidth={2.5}
            />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">
            Thank You!
          </h2>
          <p className="text-neutral-600 mb-6 text-lg leading-relaxed">
            Your feedback has been submitted successfully
          </p>
          <div className="bg-primary-50 rounded-xl p-5">
            <p className="font-bold text-primary-900 mb-2">
              Your voice matters!
            </p>
            <p className="text-sm text-primary-700 leading-relaxed">
              The mess committee will review your feedback and work on
              improvements
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main feedback form
  const ratedCount = Object.keys(ratings).length;
  const totalCount = menuItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-24">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Campus Nutrition+
            </h1>
            <p className="text-sm text-neutral-600 mt-0.5">
              Help us serve you better
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-neutral-100 active:scale-95 transition-transform"
            title="Logout"
          >
            <LogOut size={24} className="text-neutral-600" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="mobile-card bg-error-50 border-error-200 flex items-start gap-3 animate-slide-up-mobile">
            <AlertCircle
              size={24}
              className="text-error-600 flex-shrink-0 mt-0.5"
              strokeWidth={2.5}
            />
            <p className="text-sm font-semibold text-error-700 leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {/* Meal Info */}
        <div className="mobile-card-lg bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <div className="flex items-center gap-2 mb-4 opacity-90">
            <Calendar size={18} strokeWidth={2.5} />
            <span className="text-sm font-medium">{formatDate()}</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">{currentMeal}</h2>
          <div className="flex items-center gap-2 opacity-90 mb-4">
            <Clock size={18} strokeWidth={2.5} />
            <span className="text-sm font-medium">
              {getMealTiming(currentMeal)}
            </span>
          </div>
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Progress</span>
              <span className="text-sm font-bold">
                {ratedCount}/{totalCount} rated
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${(ratedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="mobile-card-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-xl">
              <User size={24} className="text-primary-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-neutral-900">
                {student?.name}
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                {student?.rollNumber} • {student?.hostel}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dish Ratings */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="mobile-section-title">Rate Today's Dishes</h3>
              <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">
                {ratedCount}/{totalCount}
              </span>
            </div>
            <div className="space-y-3">
              {menuItems.map((dish) => (
                <DishRatingCard
                  key={dish.id}
                  dish={dish}
                  onRatingChange={handleRatingChange}
                />
              ))}
            </div>
          </div>

          {/* Wastage Slider */}
          <div>
            <h3 className="mobile-section-title px-1 mb-4">Food Wastage</h3>
            <WastageSlider value={wastage} onChange={setWastage} />
          </div>

          {/* Comments */}
          <div className="mobile-card-lg">
            <label className="mobile-label">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your thoughts, suggestions, or concerns..."
              rows={4}
              className="mobile-input resize-none"
              maxLength={500}
            />
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Your feedback helps us improve meal quality
            </p>
          </div>
        </form>
      </div>

      {/* Fixed Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-lg">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mobile-btn-primary"
        >
          {isSubmitting ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send size={22} strokeWidth={2.5} />
              <span>Submit Feedback</span>
            </>
          )}
        </button>
        <p className="text-xs text-center text-neutral-500 mt-3">
          Your feedback is anonymous and secure
        </p>
      </div>
    </div>
  );
};

export default FeedbackForm;
