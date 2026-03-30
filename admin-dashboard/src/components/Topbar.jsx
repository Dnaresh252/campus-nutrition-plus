import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Bell, Search, Settings } from "lucide-react";

const PAGE_TITLES = {
  "/admin": { title: "Dashboard", sub: "Welcome back, overview at a glance" },
  "/admin/weekly-menu": {
    title: "Weekly Menu",
    sub: "Manage weekly meal templates",
  },
  "/admin/daily-override": {
    title: "Daily Override",
    sub: "Customize today's menu",
  },
  "/admin/live-feedback": {
    title: "Live Feedback",
    sub: "Real-time student responses",
  },
};

const Topbar = ({ title }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const info = PAGE_TITLES[location.pathname] || {
    title: title || "Dashboard",
    sub: "",
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-8 py-4"
      style={{
        background: "rgba(248,249,252,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        minHeight: 72,
      }}
    >
      {/* ── Left: Page title ── */}
      <div>
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-bold text-neutral-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            {info.title}
          </h1>
          {/* Live pill */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(201,168,76,0.12)",
              color: "#9a7a1e",
              border: "1px solid rgba(201,168,76,0.25)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#c9a84c" }}
            />
            Live
          </span>
        </div>
        <p className="text-sm text-neutral-400 font-medium mt-0.5">
          {format(currentTime, "EEEE, MMMM d, yyyy")} ·{" "}
          {format(currentTime, "h:mm a")}
        </p>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-56 pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
            style={{
              background: "white",
              border: "1px solid #e5e5e5",
              color: "#262626",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid rgba(201,168,76,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.10)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #e5e5e5";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Notifications */}
        <button
          className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: "white", border: "1px solid #e5e5e5" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        >
          <Bell size={18} className="text-neutral-600" />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "#e11d48" }}
          />
        </button>

        {/* Settings */}
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: "white", border: "1px solid #e5e5e5" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        >
          <Settings size={18} className="text-neutral-600" />
        </button>

        {/* System Status */}
        <div
          className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl ml-1"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold text-emerald-700">
            System Active
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
