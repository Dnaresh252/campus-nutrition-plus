import { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  Download,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Filter,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import AdminLayout from "../components/AdminLayout";
import { adminFeedbackAPI } from "../utils/adminApi";
import { format } from "date-fns";

const MEALS = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];

/* ── Tooltip ── */
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
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Stat Card ── */
const LiveStatCard = ({
  icon: Icon,
  title,
  value,
  sub,
  iconColor,
  iconBg,
  badge,
}) => (
  <div className="admin-card p-6 admin-card-hover">
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: iconBg }}
      >
        <Icon size={20} strokeWidth={2.5} style={{ color: iconColor }} />
      </div>
      {badge && (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(201,168,76,0.10)",
            color: "#9a7a1e",
            border: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          {badge}
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
    {sub && <p className="text-xs text-neutral-400 font-medium">{sub}</p>}
  </div>
);

/* ── Empty State ── */
const Empty = ({ icon: Icon, msg }) => (
  <div className="flex flex-col items-center py-16">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
      style={{
        background: "rgba(201,168,76,0.07)",
        border: "1px solid rgba(201,168,76,0.14)",
      }}
    >
      <Icon size={24} style={{ color: "#c9a84c" }} />
    </div>
    <p className="text-neutral-500 font-medium text-sm">{msg}</p>
    <p className="text-neutral-400 text-xs mt-1">
      Appears once students submit feedback
    </p>
  </div>
);

/* ══════════════════════════════════
   Main Component
══════════════════════════════════ */
const LiveFeedback = () => {
  const today = format(new Date(), "yyyy-MM-dd");

  const [selectedMeal, setSelectedMeal] = useState("LUNCH");
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const loadStats = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      setError(null);
      try {
        const res = await adminFeedbackAPI.getLiveStats(today, selectedMeal);
        if (res.success) {
          setStats(res.data);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error(err);
        setError("Could not load feedback. Check API connection.");
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [today, selectedMeal],
  );

  /* Initial + meal-change load */
  useEffect(() => {
    loadStats();
  }, [selectedMeal]);

  /* Auto-refresh */
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => loadStats(true), 10000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, loadStats]);

  /* Export CSV */
  const handleExport = async () => {
    try {
      const end = format(new Date(), "yyyy-MM-dd");
      const start = format(new Date(Date.now() - 7 * 864e5), "yyyy-MM-dd");
      await adminFeedbackAPI.exportCSV(start, end);
    } catch {
      alert("Export failed. Please try again.");
    }
  };

  /* Chart data */
  const chartData = (stats?.dishAverages ?? []).map((d) => ({
    name: d.dishId.length > 14 ? d.dishId.slice(0, 14) + "…" : d.dishId,
    fullName: d.dishId,
    rating: parseFloat(d.averageRating) || 0,
    reviews: d.totalRatings || 0,
  }));

  const avgRating = stats?.dishAverages?.length
    ? (
        stats.dishAverages.reduce(
          (a, d) => a + parseFloat(d.averageRating || 0),
          0,
        ) / stats.dishAverages.length
      ).toFixed(1)
    : null;

  return (
    <AdminLayout title="Live Feedback">
      <div className="space-y-6 animate-fade-in">
        {/* ── Controls Bar ── */}
        <div className="admin-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Meal pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={16} className="text-neutral-400 flex-shrink-0" />
              {MEALS.map((meal) => (
                <button
                  key={meal}
                  onClick={() => setSelectedMeal(meal)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                  style={
                    selectedMeal === meal
                      ? {
                          background: "linear-gradient(135deg,#1e2a8a,#0f172a)",
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

            {/* Actions */}
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-neutral-400 hidden sm:block">
                  {format(lastUpdated, "h:mm:ss a")}
                </span>
              )}

              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                style={
                  autoRefresh
                    ? {
                        background: "rgba(16,185,129,0.12)",
                        color: "#047857",
                        border: "1px solid rgba(16,185,129,0.25)",
                      }
                    : {
                        background: "white",
                        color: "#525252",
                        border: "1px solid #e5e5e5",
                      }
                }
              >
                <span
                  className={`w-2 h-2 rounded-full ${autoRefresh ? "animate-pulse" : ""}`}
                  style={{ background: autoRefresh ? "#10b981" : "#a3a3a3" }}
                />
                Auto {autoRefresh ? "On" : "Off"}
              </button>

              <button
                onClick={() => loadStats()}
                disabled={isLoading}
                className="admin-btn-secondary px-4 py-2 text-sm"
              >
                <RefreshCw
                  size={15}
                  className={isLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={handleExport}
                className="admin-btn-primary px-4 py-2 text-sm"
              >
                <Download size={15} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-xl"
            style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
          >
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              onClick={() => loadStats()}
              className="ml-auto text-xs font-bold text-red-600 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && !stats && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="loading-spinner" />
            <p className="text-neutral-500 text-sm font-medium">
              Loading feedback data…
            </p>
          </div>
        )}

        {/* ── No data state ── */}
        {!isLoading && !error && stats && stats.totalSubmissions === 0 && (
          <div className="admin-card p-10 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(201,168,76,0.07)",
                border: "1px solid rgba(201,168,76,0.14)",
              }}
            >
              <TrendingUp size={28} style={{ color: "#c9a84c" }} />
            </div>
            <p className="text-neutral-700 font-semibold">
              No feedback yet for {selectedMeal}
            </p>
            <p className="text-neutral-400 text-sm mt-1">
              Students haven't submitted feedback for this meal today.
            </p>
          </div>
        )}

        {/* ── Data content ── */}
        {stats && stats.totalSubmissions > 0 && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <LiveStatCard
                icon={Users}
                title="Total Submissions"
                value={stats.totalSubmissions.toLocaleString()}
                sub="Students responded today"
                iconColor="#1e2a8a"
                iconBg="rgba(15,23,42,0.07)"
                badge="Live"
              />
              <LiveStatCard
                icon={Star}
                title="Average Rating"
                value={avgRating ? `${avgRating} / 5` : "—"}
                sub="Across all dishes"
                iconColor="#c9a84c"
                iconBg="rgba(201,168,76,0.10)"
              />
              <LiveStatCard
                icon={AlertTriangle}
                title="Avg Wastage"
                value={`${parseFloat(stats.averageWastage || 0).toFixed(1)}%`}
                sub={
                  parseFloat(stats.averageWastage) > 40 ? "⚠ High" : "✓ Normal"
                }
                iconColor={
                  parseFloat(stats.averageWastage) > 40 ? "#e11d48" : "#059669"
                }
                iconBg={
                  parseFloat(stats.averageWastage) > 40
                    ? "rgba(225,29,72,0.08)"
                    : "rgba(16,185,129,0.08)"
                }
              />
              <LiveStatCard
                icon={MessageSquare}
                title="Comments"
                value={stats.recentComments?.length ?? 0}
                sub="Written responses"
                iconColor="#7c3aed"
                iconBg="rgba(124,58,237,0.08)"
              />
            </div>

            {/* Charts */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Rating bar */}
                <div className="admin-card p-6 admin-card-hover">
                  <div className="flex items-center gap-2 mb-5">
                    <Star size={17} style={{ color: "#c9a84c" }} />
                    <h3 className="text-base font-bold text-neutral-900">
                      Dish Ratings
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        stroke="#a3a3a3"
                        style={{ fontSize: 11 }}
                        angle={-40}
                        textAnchor="end"
                        height={80}
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

                {/* Reviews line */}
                <div className="admin-card p-6 admin-card-hover">
                  <div className="flex items-center gap-2 mb-5">
                    <Users size={17} style={{ color: "#1e2a8a" }} />
                    <h3 className="text-base font-bold text-neutral-900">
                      Review Count by Dish
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        stroke="#a3a3a3"
                        style={{ fontSize: 11 }}
                        angle={-40}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#a3a3a3" style={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="reviews"
                        name="Reviews"
                        stroke="#1e2a8a"
                        strokeWidth={2.5}
                        dot={{ fill: "#1e2a8a", r: 5, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Detailed dish list */}
            <div className="admin-card p-6 admin-card-hover">
              <h3 className="text-base font-bold text-neutral-900 mb-5">
                All Dish Ratings
              </h3>
              {stats.dishAverages?.length > 0 ? (
                <div className="space-y-2">
                  {[...stats.dishAverages]
                    .sort(
                      (a, b) =>
                        parseFloat(b.averageRating) -
                        parseFloat(a.averageRating),
                    )
                    .map((dish, index) => {
                      const rating = parseFloat(dish.averageRating) || 0;
                      const pct = (rating / 5) * 100;
                      return (
                        <div
                          key={dish.dishId}
                          className="flex items-center gap-4 p-4 rounded-xl transition-all"
                          style={{
                            background:
                              index === 0 ? "rgba(201,168,76,0.05)" : "#fafafa",
                            border:
                              index === 0
                                ? "1px solid rgba(201,168,76,0.15)"
                                : "1px solid transparent",
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={
                              index === 0
                                ? {
                                    background:
                                      "linear-gradient(135deg,#f5c842,#c9a84c)",
                                    color: "#0f172a",
                                  }
                                : { background: "#efefef", color: "#737373" }
                            }
                          >
                            #{index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 truncate">
                              {dish.dishId}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    background:
                                      pct >= 80
                                        ? "#c9a84c"
                                        : pct >= 60
                                          ? "#1e2a8a"
                                          : "#a3a3a3",
                                  }}
                                />
                              </div>
                              <span className="text-xs text-neutral-400 w-16 text-right">
                                {dish.totalRatings} reviews
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                style={{
                                  color:
                                    s <= Math.round(rating)
                                      ? "#c9a84c"
                                      : "#e5e5e5",
                                  fill:
                                    s <= Math.round(rating)
                                      ? "#c9a84c"
                                      : "#e5e5e5",
                                }}
                              />
                            ))}
                            <span className="text-sm font-bold text-neutral-900 ml-1 w-8">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <Empty icon={Star} msg="No dish ratings yet" />
              )}
            </div>

            {/* AI Insights Summary */}
            {stats.recentComments?.some((c) => c.ai_analysis) && (
              <div className="admin-card p-6 admin-card-hover">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-lg">🤖</span>
                  <h3 className="text-base font-bold text-neutral-900">
                    AI Sentiment Insights
                  </h3>
                  <span
                    className="ml-2 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(201,168,76,0.10)",
                      color: "#9a7a1e",
                      border: "1px solid rgba(201,168,76,0.2)",
                    }}
                  >
                    Powered by DistilBERT
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      emoji: "🟢",
                      label: "Positive",
                      count: stats.recentComments.filter(
                        (c) => c.ai_analysis?.sentiment === "POSITIVE",
                      ).length,
                      color: "#059669",
                      bg: "rgba(5,150,105,0.07)",
                    },
                    {
                      emoji: "🟡",
                      label: "Neutral",
                      count: stats.recentComments.filter(
                        (c) => c.ai_analysis?.sentiment === "NEUTRAL",
                      ).length,
                      color: "#d97706",
                      bg: "rgba(217,119,6,0.07)",
                    },
                    {
                      emoji: "🔴",
                      label: "Negative",
                      count: stats.recentComments.filter(
                        (c) => c.ai_analysis?.sentiment === "NEGATIVE",
                      ).length,
                      color: "#e11d48",
                      bg: "rgba(225,29,72,0.07)",
                    },
                    {
                      emoji: "🚨",
                      label: "Critical",
                      count: stats.recentComments.filter(
                        (c) => c.ai_analysis?.urgency === "CRITICAL",
                      ).length,
                      color: "#dc2626",
                      bg: "rgba(220,38,38,0.07)",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl p-4 text-center"
                      style={{
                        background: item.bg,
                        border: `1px solid ${item.color}22`,
                      }}
                    >
                      <p className="text-2xl mb-1">{item.emoji}</p>
                      <p
                        className="text-2xl font-bold mb-0.5"
                        style={{ color: item.color }}
                      >
                        {item.count}
                      </p>
                      <p className="text-xs font-semibold text-neutral-500">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments feed */}
            <div className="admin-card p-6 admin-card-hover">
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare size={17} style={{ color: "#1e2a8a" }} />
                <h3 className="text-base font-bold text-neutral-900">
                  Live Comments Feed
                </h3>
                {autoRefresh && (
                  <span
                    className="ml-2 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,0.10)",
                      color: "#047857",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              {stats.recentComments?.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {stats.recentComments.map((comment, index) => {
                    const ai = comment.ai_analysis;
                    const urgencyColors = {
                      CRITICAL: { bg: "rgba(220,38,38,0.08)", border: "#dc2626", text: "#dc2626" },
                      HIGH:     { bg: "rgba(234,88,12,0.08)",  border: "#ea580c", text: "#ea580c" },
                      MEDIUM:   { bg: "rgba(217,119,6,0.08)",  border: "#d97706", text: "#d97706" },
                      LOW:      { bg: "rgba(100,116,139,0.08)",border: "#64748b", text: "#64748b" },
                      NONE:     { bg: "rgba(5,150,105,0.08)",  border: "#059669", text: "#059669" },
                    };
                    const uc = ai ? (urgencyColors[ai.urgency] ?? urgencyColors.NONE) : null;

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-xl animate-slide-in-right"
                        style={{
                          background: ai ? uc.bg : "#fafafa",
                          borderLeft: `3px solid ${ai ? uc.border : "#c9a84c"}`,
                          animationDelay: `${index * 40}ms`,
                        }}
                      >
                        {/* Comment text */}
                        <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                          "{comment.comments}"
                        </p>

                        {/* AI Analysis badges */}
                        {ai && (
                          <div className="space-y-2 mb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Sentiment */}
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: "rgba(15,23,42,0.07)", color: "#0f172a" }}>
                                {ai.sentiment_emoji} {ai.sentiment}
                              </span>
                              {/* Score */}
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: "rgba(201,168,76,0.10)", color: "#9a7a1e" }}>
                                Score: {ai.score}/5
                              </span>
                              {/* Urgency */}
                              {ai.urgency !== "NONE" && (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                  style={{ background: uc.bg, color: uc.text, border: `1px solid ${uc.border}44` }}>
                                  ⚡ {ai.urgency}
                                </span>
                              )}
                              {/* Confidence */}
                              <span className="text-xs text-neutral-400 font-medium">
                                {ai.confidence}% confidence
                              </span>
                            </div>

                            {/* Issues */}
                            {ai.issues?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {ai.issues.map((issue) => (
                                  <span key={issue}
                                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                                    style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
                                    ⚠ {issue}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Dishes mentioned */}
                            {ai.dishes_mentioned?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {ai.dishes_mentioned.map((dish) => (
                                  <span key={dish}
                                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                                    style={{ background: "rgba(30,42,138,0.07)", color: "#1e2a8a" }}>
                                    🍽 {dish}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Suggested action for critical/high */}
                            {(ai.urgency === "CRITICAL" || ai.urgency === "HIGH") && (
                              <div className="flex items-start gap-2 px-3 py-2 rounded-lg"
                                style={{ background: uc.bg, border: `1px solid ${uc.border}33` }}>
                                <span className="text-xs">💡</span>
                                <p className="text-xs font-semibold" style={{ color: uc.text }}>
                                  {ai.suggested_action}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-400">
                            {format(new Date(comment.submitted_at), "h:mm:ss a")}
                          </span>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: ai ? uc.bg : "rgba(201,168,76,0.10)",
                              color: ai ? uc.text : "#9a7a1e",
                            }}
                          >
                            {ai ? "AI Analyzed" : "Pending AI"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty icon={MessageSquare} msg="No comments yet" />
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default LiveFeedback;
