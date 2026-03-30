import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  MessageSquare,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/weekly-menu", icon: Calendar, label: "Weekly Menu" },
  { to: "/admin/daily-override", icon: Clock, label: "Daily Override" },
  { to: "/admin/live-feedback", icon: MessageSquare, label: "Live Feedback" },
];

const Sidebar = () => {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-30"
      style={{
        width: "260px",
        background:
          "linear-gradient(180deg, #0a0f1e 0%, #0f172a 50%, #0c1526 100%)",
        borderRight: "1px solid rgba(201,168,76,0.10)",
      }}
    >
      {/* ══ Brand ══ */}
      <div
        className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* 
          Logo fix: the PNG has a white background.
          We render it inside a white rounded square — looks intentional and clean.
          On the dark sidebar this creates a "badge" look which is premium.
        */}
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            background: "#ffffff",
            padding: "3px",
            boxShadow:
              "0 0 0 1px rgba(201,168,76,0.3), 0 4px 12px rgba(0,0,0,0.4)",
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

        <div className="min-w-0">
          <p
            className="text-sm font-bold leading-tight truncate"
            style={{
              background: "linear-gradient(90deg, #f5c842 0%, #c9a84c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Aditya University
          </p>
          <p
            className="text-xs font-medium mt-0.5"
            style={{ color: "rgba(255,255,255,0.32)" }}
          >
            Campus Nutrition+
          </p>
        </div>
      </div>

      {/* ══ Nav ══ */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p
          className="text-xs font-bold uppercase tracking-widest px-3 mb-4"
          style={{ color: "rgba(201,168,76,0.40)" }}
        >
          Main Menu
        </p>

        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className="block"
              >
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(135deg, #f5c842 0%, #d4a832 100%)",
                          boxShadow: "0 4px 16px rgba(201,168,76,0.28)",
                        }
                      : { background: "transparent" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={
                      isActive
                        ? { background: "rgba(10,15,30,0.18)" }
                        : { background: "rgba(255,255,255,0.05)" }
                    }
                  >
                    <item.icon
                      size={16}
                      strokeWidth={2.5}
                      style={{
                        color: isActive ? "#0a0f1e" : "rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>

                  <span
                    className="text-sm font-semibold flex-1 truncate"
                    style={{
                      color: isActive ? "#0a0f1e" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <ChevronRight
                      size={13}
                      style={{ color: "rgba(10,15,30,0.35)", flexShrink: 0 }}
                    />
                  )}
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ══ User ══ */}
      <div
        className="px-3 pb-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="rounded-xl p-3 mt-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.10)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #f5c842 0%, #c9a84c 100%)",
                color: "#0a0f1e",
              }}
            >
              {admin?.username?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {admin?.username || "Admin"}
              </p>
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.32)" }}
              >
                Administrator
              </p>
            </div>
            {/* Online dot */}
            <div className="relative w-2.5 h-2.5 flex-shrink-0">
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-50"
                style={{ background: "#10b981" }}
              />
              <span
                className="relative block w-2.5 h-2.5 rounded-full"
                style={{ background: "#10b981" }}
              />
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-200"
            style={{
              background: "rgba(239,68,68,0.08)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.12)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.12)";
            }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
