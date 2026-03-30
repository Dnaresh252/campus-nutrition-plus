import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Home, DoorOpen, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { validateRollNumber } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    rollNumber: "",
    name: "",
    hostel: "",
    room: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const hostels = [
    "Boys Hostel A",
    "Boys Hostel B",
    "Boys Hostel C",
    "Girls Hostel A",
    "Girls Hostel B",
    "Girls Hostel C",
  ];

  const validateForm = () => {
    const newErrors = {};

    // Roll number validation
    if (!formData.rollNumber) {
      newErrors.rollNumber = "Roll number is required";
    } else if (!validateRollNumber(formData.rollNumber)) {
      newErrors.rollNumber = "Invalid format (uppercase letters and digits, 5-15 chars)";
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Hostel validation
    if (!formData.hostel) {
      newErrors.hostel = "Please select your hostel";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(
        formData.rollNumber,
        formData.name,
        formData.hostel,
        formData.room,
      );

      if (result.success) {
        // Navigate to feedback form
        navigate("/feedback");
      } else {
        setServerError(result.error);
      }
    } catch (error) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rollNumber" ? value.toUpperCase() : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User size={40} className="text-primary-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Campus Nutrition+
          </h1>
          <p className="text-neutral-600 text-lg">Welcome! Let's get started</p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mobile-card bg-error-50 border-error-200 flex items-start gap-3 mb-4 animate-slide-up-mobile">
            <AlertCircle
              size={24}
              className="text-error-600 flex-shrink-0 mt-0.5"
              strokeWidth={2.5}
            />
            <p className="text-sm font-semibold text-error-700">
              {serverError}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Roll Number */}
          <div className="mobile-card-lg">
            <label className="mobile-label flex items-center gap-2">
              <User size={18} className="text-neutral-600" />
              Roll Number
            </label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g., 22P31A05B1"
              className={`mobile-input ${errors.rollNumber ? "border-error-500" : ""}`}
              maxLength={15}
            />
            {errors.rollNumber && (
              <p className="text-sm text-error-600 mt-2 font-medium">
                {errors.rollNumber}
              </p>
            )}
            <p className="text-xs text-neutral-500 mt-2">
              Enter your college roll number
            </p>
          </div>

          {/* Name */}
          <div className="mobile-card-lg">
            <label className="mobile-label flex items-center gap-2">
              <User size={18} className="text-neutral-600" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={`mobile-input ${errors.name ? "border-error-500" : ""}`}
            />
            {errors.name && (
              <p className="text-sm text-error-600 mt-2 font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Hostel */}
          <div className="mobile-card-lg">
            <label className="mobile-label flex items-center gap-2">
              <Home size={18} className="text-neutral-600" />
              Hostel
            </label>
            <select
              name="hostel"
              value={formData.hostel}
              onChange={handleChange}
              className={`mobile-input ${errors.hostel ? "border-error-500" : ""}`}
            >
              <option value="">Select your hostel</option>
              {hostels.map((hostel) => (
                <option key={hostel} value={hostel}>
                  {hostel}
                </option>
              ))}
            </select>
            {errors.hostel && (
              <p className="text-sm text-error-600 mt-2 font-medium">
                {errors.hostel}
              </p>
            )}
          </div>

          {/* Room (Optional) */}
          <div className="mobile-card-lg">
            <label className="mobile-label flex items-center gap-2">
              <DoorOpen size={18} className="text-neutral-600" />
              Room Number (Optional)
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              placeholder="e.g., 204"
              className="mobile-input"
              maxLength={10}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mobile-btn-primary w-full"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600 leading-relaxed">
            Your information is secure and will be used only for mess feedback.
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            You'll stay logged in on this device
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
