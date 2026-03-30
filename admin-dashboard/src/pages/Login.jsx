import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Shield,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Login failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f2f8" }}>
      {/* ══════════════════════════════════════
          LEFT PANEL — University Branding
      ══════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden"
        style={{
          background:
            "linear-gradient(150deg, #08101f 0%, #0f172a 45%, #0c1a38 100%)",
        }}
      >
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(201,168,76,0.12) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top-right gold bloom */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 65%)",
          }}
        />
        {/* Bottom-left navy bloom */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-60px",
            left: "-60px",
            width: "360px",
            height: "360px",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          {/* Logo + name */}
          <div className="flex items-center gap-4">
            <div
              className="rounded-2xl overflow-hidden flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                background: "#fff",
                padding: "4px",
                boxShadow:
                  "0 0 0 1px rgba(201,168,76,0.35), 0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <img
                src="/logo.png"
                alt="Aditya University"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <div>
              <p
                className="text-lg font-bold"
                style={{
                  background:
                    "linear-gradient(90deg, #f5c842 0%, #c9a84c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Aditya University
              </p>
              <p
                className="text-xs font-medium mt-0.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Campus Nutrition+ · Admin Portal
              </p>
            </div>
          </div>

          {/* Main copy */}
          <div className="mt-auto mb-auto pt-12">
            {/* Pill tag */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-8"
              style={{
                background: "rgba(201,168,76,0.10)",
                border: "1px solid rgba(201,168,76,0.22)",
                color: "#c9a84c",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#c9a84c" }}
              />
              Admin Dashboard · 2025–26
            </div>

            <h2
              className="font-bold leading-[1.12] mb-6"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3.25rem)",
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              Manage your
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #f5c842 0%, #c9a84c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                campus mess
              </span>
              <br />
              with intelligence.
            </h2>

            <p
              className="text-base leading-relaxed max-w-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Real-time analytics, smart menu management, and student-first
              insights — built for Aditya University.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "500+", label: "Students" },
              { value: "4.5★", label: "Avg Rating" },
              { value: "98%", label: "Uptime" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl py-5 px-4 text-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,168,76,0.10)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <p
                  className="text-2xl font-bold mb-1"
                  style={{
                    background:
                      "linear-gradient(90deg, #f5c842 0%, #c9a84c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative">
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(15,23,42,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative w-full max-w-md">
          {/* Card */}
          <div
            className="rounded-3xl p-8 lg:p-10"
            style={{
              background: "#ffffff",
              boxShadow:
                "0 24px 64px rgba(15,23,42,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            {/* Mobile logo */}
            <div
              className="lg:hidden flex items-center gap-3 mb-8 pb-6"
              style={{ borderBottom: "1px solid #f0f0f0" }}
            >
              <div
                className="rounded-xl overflow-hidden flex-shrink-0"
                style={{
                  width: 38,
                  height: 38,
                  background: "#fff",
                  padding: "2px",
                  boxShadow:
                    "0 0 0 1px rgba(201,168,76,0.3), 0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <img
                  src="/logo.png"
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  Aditya University
                </p>
                <p className="text-xs text-neutral-400">Campus Nutrition+</p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2
                className="text-3xl font-bold text-neutral-900 mb-2"
                style={{ letterSpacing: "-0.025em" }}
              >
                Welcome back
              </h2>
              <p className="text-sm text-neutral-500">
                Sign in to access the admin dashboard
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl mb-6"
                style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
              >
                <AlertCircle
                  size={17}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  style={{ color: "#262626" }}
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#a3a3a3" }}
                  />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Enter your username"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: "#fafafa",
                      border: "1.5px solid #e5e5e5",
                      color: "#171717",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1.5px solid #c9a84c";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(201,168,76,0.10)";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1.5px solid #e5e5e5";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#fafafa";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  style={{ color: "#262626" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#a3a3a3" }}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: "#fafafa",
                      border: "1.5px solid #e5e5e5",
                      color: "#171717",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1.5px solid #c9a84c";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(201,168,76,0.10)";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1.5px solid #e5e5e5";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#fafafa";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                    style={{ color: "#a3a3a3" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#c9a84c";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#a3a3a3";
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-base font-bold transition-all duration-200"
                style={{
                  background: isLoading
                    ? "rgba(15,23,42,0.7)"
                    : "linear-gradient(135deg, #1e2a8a 0%, #0f172a 100%)",
                  color: "white",
                  boxShadow: isLoading
                    ? "none"
                    : "0 6px 24px rgba(15,23,42,0.30)",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading)
                    e.currentTarget.style.boxShadow =
                      "0 10px 32px rgba(15,23,42,0.40)";
                }}
                onMouseLeave={(e) => {
                  if (!isLoading)
                    e.currentTarget.style.boxShadow =
                      "0 6px 24px rgba(15,23,42,0.30)";
                }}
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div
              className="my-7"
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, #e5e5e5 30%, #e5e5e5 70%, transparent)",
              }}
            />

            {/* Info cards */}
            <div className="space-y-3">
              <div
                className="flex items-start gap-3.5 p-4 rounded-2xl"
                style={{
                  background: "rgba(201,168,76,0.04)",
                  border: "1px solid rgba(201,168,76,0.16)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,168,76,0.12)" }}
                >
                  <Shield size={15} style={{ color: "#c9a84c" }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-800">
                    Secure Access
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Your session is encrypted and protected
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-3.5 p-4 rounded-2xl"
                style={{
                  background: "#fafafa",
                  border: "1px solid #efefef",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(15,23,42,0.06)" }}
                >
                  <Sparkles size={15} style={{ color: "#525252" }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-800">
                    Authorized Personnel Only
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Contact your system administrator for access credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: "rgba(15,23,42,0.35)" }}
          >
            © 2026 Aditya University · Campus Nutrition+ · Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
