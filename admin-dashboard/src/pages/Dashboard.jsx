import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  MessageSquare,
  RefreshCw,
  ChefHat,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import AdminLayout from "../components/AdminLayout";
import { adminFeedbackAPI } from "../utils/adminApi";
import { format, subDays } from "date-fns";

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  iconBg,
  iconColor,
}) => (
  <div className="stats-card-premium">
    <div className="flex items-start justify-between mb-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={20} strokeWidth={2.5} style={{ color: iconColor }} />
      </div>
      {trend !== undefined && trend !== null && (
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
          style={
            trend >= 0
              ? { background: "rgba(16,185,129,0.10)", color: "#047857" }
              : { background: "rgba(225,29,72,0.10)", color: "#be123c" }
          }
        >
          {trend >= 0 ? (
            <ArrowUpRight size={12} />
          ) : (
            <ArrowDownRight size={12} />
          )}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-sm font-semibold text-neutral-500 mb-1">{title}</p>
    <p
      className="text-3xl font-bold text-neutral-900 mb-1"
      style={{ letterSpacing: "-0.02em" }}
    >
      {value}
    </p>
    {subtitle && (
      <p className="text-xs text-neutral-400 font-medium">{subtitle}</p>
    )}
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{
        background: "rgba(201,168,76,0.08)",
        border: "1px solid rgba(201,168,76,0.15)",
      }}
    >
      <Icon size={28} style={{ color: "#c9a84c" }} />
    </div>
    <p className="text-neutral-500 font-medium">{message}</p>
    <p className="text-neutral-400 text-sm mt-1">
      Data will appear once students submit feedback
    </p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: "white",
        border: "1px solid #e5e5e5",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      }}
    >
      <p className="font-bold text-neutral-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────── */

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];

const Dashboard = () => {
  const navigate = useNavigate();
  const today = format(new Date(), "yyyy-MM-dd");

  const [selectedMeal, setSelectedMeal] = useState("LUNCH");
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  /* Fetch today's stats for selected meal */
  const fetchTodayStats = useCallback(
    async (meal, showRefresh = false) => {
      if (showRefresh) setIsRefreshing(true);
      setError(null);
      try {
        const res = await adminFeedbackAPI.getLiveStats(today, meal);
        if (res.success) {
          setStats(res.data);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error("Stats error:", err);
        setError("Failed to load stats. Check your connection.");
        setStats(null);
      } finally {
        if (showRefresh) setIsRefreshing(false);
      }
    },
    [today],
  );

  /* Fetch real weekly analytics (last 7 days) */
  const fetchWeeklyData = useCallback(async () => {
    try {
      const endDate = format(new Date(), "yyyy-MM-dd");
      const startDate = format(subDays(new Date(), 6), "yyyy-MM-dd");
      const res = await adminFeedbackAPI.getAnalytics(startDate, endDate);

      if (res.success && res.data) {
        /* Normalize whatever shape the API returns into chart-friendly rows */
        const normalized = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const dateKey = format(date, "yyyy-MM-dd");
          const dayData =
            res.data[dateKey] ||
            res.data.find?.((d) => d.date === dateKey) ||
            {};
          return {
            day: format(date, "EEE"),
            date: dateKey,
            submissions: dayData.totalSubmissions ?? dayData.submissions ?? 0,
            rating: dayData.avgRating ?? dayData.rating ?? 0,
            wastage: dayData.avgWastage ?? dayData.wastage ?? 0,
          };
        });
        setWeeklyData(normalized);
      } else {
        /* API returned no data — use empty slots so chart renders cleanly */
        setWeeklyData(
          Array.from({ length: 7 }, (_, i) => ({
            day: format(subDays(new Date(), 6 - i), "EEE"),
            date: format(subDays(new Date(), 6 - i), "yyyy-MM-dd"),
            submissions: 0,
            rating: 0,
            wastage: 0,
          })),
        );
      }
    } catch {
      /* Analytics endpoint optional — fail silently */
      setWeeklyData([]);
    }
  }, []);

  /* Initial load */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchTodayStats(selectedMeal), fetchWeeklyData()]);
      setIsLoading(false);
    };
    load();
  }, []);

  /* Re-fetch when meal tab changes */
  useEffect(() => {
    fetchTodayStats(selectedMeal);
  }, [selectedMeal]);

  /* Derived values */
  const avgRating =
    stats?.dishAverages?.length > 0
      ? (
          stats.dishAverages.reduce(
            (acc, d) => acc + parseFloat(d.averageRating || 0),
            0,
          ) / stats.dishAverages.length
        ).toFixed(1)
      : null;

  const wastage = stats?.averageWastage ?? null;
  const totalSub = stats?.totalSubmissions ?? null;

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="loading-spinner" />
          <p className="text-neutral-500 font-medium text-sm">
            Loading dashboard data…
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-7 animate-fade-in">
        {/* ── Error Banner ── */}
        {error && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-xl"
            style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
          >
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              onClick={() => fetchTodayStats(selectedMeal, true)}
              className="ml-auto text-xs font-bold text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Meal Selector + Refresh ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {MEAL_TYPES.map((meal) => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                style={
                  selectedMeal === meal
                    ? {
                        background:
                          "linear-gradient(135deg, #1e2a8a 0%, #0f172a 100%)",
                        color: "white",
                        boxShadow: "0 4px 14px rgba(15,23,42,0.25)",
                      }
                    : {
                        background: "white",
                        color: "#525252",
                        border: "1px solid #e5e5e5",
                      }
                }
              >
                {meal}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-neutral-400 font-medium hidden sm:block">
                Updated {format(lastUpdated, "h:mm a")}
              </span>
            )}
            <button
              onClick={() => fetchTodayStats(selectedMeal, true)}
              disabled={isRefreshing}
              className="admin-btn-secondary px-4 py-2 text-sm"
            >
              <RefreshCw
                size={15}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={Users}
            title="Total Submissions"
            value={totalSub !== null ? totalSub.toLocaleString() : "—"}
            subtitle={`${selectedMeal.charAt(0) + selectedMeal.slice(1).toLowerCase()} · Today`}
            iconBg="rgba(15,23,42,0.07)"
            iconColor="#1e2a8a"
          />
          <StatCard
            icon={Star}
            title="Average Rating"
            value={avgRating !== null ? `${avgRating} / 5` : "—"}
            subtitle="Across all dishes"
            iconBg="rgba(201,168,76,0.12)"
            iconColor="#c9a84c"
          />
          <StatCard
            icon={AlertTriangle}
            title="Avg Wastage"
            value={
              wastage !== null ? `${parseFloat(wastage).toFixed(1)}%` : "—"
            }
            subtitle={
              wastage !== null
                ? parseFloat(wastage) > 40
                  ? "⚠ High — needs attention"
                  : "✓ Within normal range"
                : "No data yet"
            }
            iconBg={
              wastage !== null && parseFloat(wastage) > 40
                ? "rgba(225,29,72,0.08)"
                : "rgba(16,185,129,0.08)"
            }
            iconColor={
              wastage !== null && parseFloat(wastage) > 40
                ? "#e11d48"
                : "#059669"
            }
          />
          <StatCard
            icon={Activity}
            title="Dishes Rated"
            value={stats?.dishAverages?.length ?? "—"}
            subtitle="Items with feedback"
            iconBg="rgba(139,92,246,0.08)"
            iconColor="#7c3aed"
          />
        </div>

        {/* ── Weekly Charts (real data) ── */}
        {weeklyData.length > 0 && weeklyData.some((d) => d.submissions > 0) ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Submissions Trend */}
            <div className="lg:col-span-2 admin-card p-6 admin-card-hover">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Weekly Submissions
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Last 7 days · All meals
                  </p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(201,168,76,0.10)",
                    color: "#9a7a1e",
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}
                >
                  Real Data
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#1e2a8a"
                        stopOpacity={0.18}
                      />
                      <stop offset="95%" stopColor="#1e2a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    stroke="#a3a3a3"
                    style={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#a3a3a3" style={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    name="Submissions"
                    stroke="#1e2a8a"
                    strokeWidth={2.5}
                    fill="url(#subGrad)"
                    dot={{ fill: "#1e2a8a", r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Rating Bar */}
            <div className="admin-card p-6 admin-card-hover">
              <div className="mb-5">
                <h3 className="text-base font-bold text-neutral-900">
                  Daily Ratings
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Avg score per day
                </p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    stroke="#a3a3a3"
                    style={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    stroke="#a3a3a3"
                    style={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="rating"
                    name="Rating"
                    fill="#c9a84c"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* No weekly data yet */
          <div className="admin-card p-6">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Weekly Trends
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Last 7 days · All meals
            </p>
            <div
              className="rounded-xl py-10 text-center"
              style={{ background: "#fafafa", border: "1px dashed #e5e5e5" }}
            >
              <TrendingUp size={32} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-400 font-medium">
                No weekly data yet
              </p>
              <p className="text-xs text-neutral-300 mt-1">
                Charts will populate as students submit feedback
              </p>
            </div>
          </div>
        )}

        {/* ── Top Dishes & Recent Comments ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Rated Dishes */}
          <div className="admin-card p-6 admin-card-hover">
            <div className="flex items-center gap-2 mb-5">
              <Star size={18} style={{ color: "#c9a84c" }} />
              <h3 className="text-base font-bold text-neutral-900">
                Top Rated Dishes
              </h3>
              <span
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(201,168,76,0.10)",
                  color: "#9a7a1e",
                }}
              >
                {selectedMeal}
              </span>
            </div>

            {stats?.dishAverages?.length > 0 ? (
              <div className="space-y-2">
                {stats.dishAverages
                  .sort(
                    (a, b) =>
                      parseFloat(b.averageRating) - parseFloat(a.averageRating),
                  )
                  .slice(0, 5)
                  .map((dish, index) => (
                    <div
                      key={dish.dishId}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all"
                      style={{
                        background:
                          index === 0 ? "rgba(201,168,76,0.06)" : "#fafafa",
                        border:
                          index === 0
                            ? "1px solid rgba(201,168,76,0.18)"
                            : "1px solid transparent",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={
                          index === 0
                            ? {
                                background:
                                  "linear-gradient(135deg,#f5c842,#c9a84c)",
                                color: "#0f172a",
                              }
                            : index === 1
                              ? { background: "#e5e5e5", color: "#525252" }
                              : { background: "#f5f5f5", color: "#737373" }
                        }
                      >
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {dish.dishId}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {dish.totalRatings} ratings
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Star
                          size={13}
                          style={{ color: "#c9a84c", fill: "#c9a84c" }}
                        />
                        <span className="text-sm font-bold text-neutral-900">
                          {parseFloat(dish.averageRating).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState icon={Star} message="No dish ratings yet" />
            )}
          </div>

          {/* Recent Comments */}
          <div className="admin-card p-6 admin-card-hover">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare size={18} style={{ color: "#1e2a8a" }} />
              <h3 className="text-base font-bold text-neutral-900">
                Recent Comments
              </h3>
              <span
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(15,23,42,0.06)", color: "#1e2a8a" }}
              >
                {stats?.recentComments?.length ?? 0} total
              </span>
            </div>

            {stats?.recentComments?.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {stats.recentComments.slice(0, 6).map((comment, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl"
                    style={{
                      background: "#fafafa",
                      borderLeft: "3px solid #c9a84c",
                    }}
                  >
                    <p className="text-sm text-neutral-700 leading-relaxed mb-2">
                      "{comment.comments}"
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">
                        {format(new Date(comment.submitted_at), "h:mm a")}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(15,23,42,0.06)",
                          color: "#1e2a8a",
                        }}
                      >
                        Student
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={MessageSquare} message="No comments yet" />
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="admin-card p-6">
          <h3 className="text-base font-bold text-neutral-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Manage Weekly Menu",
                sub: "Edit template menus",
                icon: Calendar,
                path: "/admin/weekly-menu",
                color: "#1e2a8a",
                bg: "rgba(15,23,42,0.04)",
              },
              {
                label: "Today's Override",
                sub: "Modify today's menu",
                icon: Clock,
                path: "/admin/daily-override",
                color: "#059669",
                bg: "rgba(5,150,105,0.04)",
              },
              {
                label: "Live Feedback",
                sub: "View real-time ratings",
                icon: TrendingUp,
                path: "/admin/live-feedback",
                color: "#c9a84c",
                bg: "rgba(201,168,76,0.06)",
              },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex items-start gap-4 p-5 rounded-xl text-left transition-all duration-200 group"
                style={{
                  background: action.bg,
                  border: "1px solid #e5e5e5",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#e5e5e5";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${action.color}18` }}
                >
                  <action.icon
                    size={20}
                    style={{ color: action.color }}
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    {action.label}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {action.sub}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
