import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { adminMenuAPI } from "../utils/adminApi";

const DAYS = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 7, label: "Sunday", short: "Sun" },
];
const MEALS = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];
const CATEGORIES = [
  "Main Course",
  "Curry",
  "Side Dish",
  "Bread",
  "Beverage",
  "Dessert",
  "Salad",
  "Soup",
];
const MEAL_ICONS = { BREAKFAST: "🌅", LUNCH: "☀️", SNACKS: "🍎", DINNER: "🌙" };

/* ── Toast ── */
const Toast = ({ toast }) =>
  toast ? (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg animate-slide-in-right"
      style={
        toast.type === "error"
          ? {
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
            }
          : { background: "rgba(15,23,42,0.95)", color: "white" }
      }
    >
      <span style={{ color: toast.type === "error" ? "#e11d48" : "#c9a84c" }}>
        {toast.type === "error" ? "✕" : "✓"}
      </span>
      <span className="text-sm font-semibold">{toast.msg}</span>
    </div>
  ) : null;

/* ── Meal Cell ── */
const MealCell = ({
  day,
  meal,
  menu,
  editingMenu,
  showAddDish,
  newDish,
  onEdit,
  onSave,
  onCancel,
  onAddDish,
  onRemoveDish,
  onCopy,
  onDelete,
  onNewDishChange,
  onToggleAddForm,
}) => {
  const isEditing =
    editingMenu?.dayOfWeek === day && editingMenu?.mealType === meal;
  const hasDishes = menu?.dishes?.length > 0;

  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}
    >
      {/* Meal header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{MEAL_ICONS[meal]}</span>
          <span className="text-sm font-bold text-neutral-700">
            {meal.charAt(0) + meal.slice(1).toLowerCase()}
          </span>
          {hasDishes && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(201,168,76,0.10)", color: "#9a7a1e" }}
            >
              {menu.dishes.length}
            </span>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(day, meal)}
              className="p-1.5 rounded-lg transition-all text-neutral-400 hover:text-neutral-700 hover:bg-white"
              title="Edit menu"
            >
              <Edit2 size={14} />
            </button>
            {hasDishes && (
              <>
                <button
                  onClick={() => onCopy(day, meal)}
                  className="p-1.5 rounded-lg transition-all text-neutral-400 hover:text-neutral-700 hover:bg-white"
                  title="Copy to another day"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => onDelete(day, meal)}
                  className="p-1.5 rounded-lg transition-all text-neutral-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete menu"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* View mode */}
      {!isEditing &&
        (hasDishes ? (
          <div className="space-y-1.5">
            {menu.dishes.map((dish) => (
              <div key={dish.id} className="flex items-start gap-2">
                <span
                  className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                  style={{ background: "#c9a84c" }}
                />
                <div>
                  <span className="text-sm font-medium text-neutral-800">
                    {dish.name}
                  </span>
                  <span className="text-xs text-neutral-400 ml-1.5">
                    ({dish.category})
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={() => onEdit(day, meal)}
            className="w-full py-4 rounded-lg border-2 border-dashed text-sm font-semibold transition-all"
            style={{ borderColor: "#e5e5e5", color: "#a3a3a3" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#c9a84c";
              e.currentTarget.style.color = "#c9a84c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e5e5";
              e.currentTarget.style.color = "#a3a3a3";
            }}
          >
            + Set Menu
          </button>
        ))}

      {/* Edit mode */}
      {isEditing && (
        <div className="space-y-3">
          {/* Dish list */}
          {editingMenu.dishes.length > 0 ? (
            <div className="space-y-1.5">
              {editingMenu.dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between p-2.5 rounded-lg"
                  style={{ background: "white", border: "1px solid #f0f0f0" }}
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {dish.name}
                    </p>
                    <p className="text-xs text-neutral-400">{dish.category}</p>
                  </div>
                  <button
                    onClick={() => onRemoveDish(dish.id)}
                    className="p-1 rounded-md ml-2 transition-all"
                    style={{ color: "#a3a3a3" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#e11d48";
                      e.currentTarget.style.background = "rgba(225,29,72,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#a3a3a3";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-neutral-400 py-3">
              No dishes — saving will clear this menu
            </p>
          )}

          {/* Add form toggle */}
          {showAddDish ? (
            <div
              className="space-y-2 p-3 rounded-xl"
              style={{
                background: "rgba(201,168,76,0.05)",
                border: "1px solid rgba(201,168,76,0.15)",
              }}
            >
              <input
                type="text"
                value={newDish.name}
                onChange={(e) =>
                  onNewDishChange({ ...newDish, name: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && onAddDish()}
                placeholder="Dish name (press Enter)"
                className="admin-input text-sm py-2"
                autoFocus
              />
              <select
                value={newDish.category}
                onChange={(e) =>
                  onNewDishChange({ ...newDish, category: e.target.value })
                }
                className="admin-input text-sm py-2"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={onAddDish}
                  className="admin-btn-primary flex-1 text-xs py-2"
                >
                  Add
                </button>
                <button
                  onClick={() => onToggleAddForm(false)}
                  className="admin-btn-secondary flex-1 text-xs py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onToggleAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: "white",
                border: "1px dashed #d4d4d4",
                color: "#737373",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c9a84c";
                e.currentTarget.style.color = "#c9a84c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d4d4d4";
                e.currentTarget.style.color = "#737373";
              }}
            >
              <Plus size={13} /> Add Dish
            </button>
          )}

          {/* Save / Cancel */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onSave}
              className="admin-btn-primary flex-1 text-xs py-2.5"
            >
              <Save size={13} /> Save
            </button>
            <button
              onClick={onCancel}
              className="admin-btn-secondary flex-1 text-xs py-2.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════
   Main Page
══════════════════════════════════ */
const WeeklyMenu = () => {
  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState(null);
  const [showAddDish, setShowAddDish] = useState(false);
  const [newDish, setNewDish] = useState({ name: "", category: "Main Course" });
  const [expandedDay, setExpandedDay] = useState(null);
  const [copyTarget, setCopyTarget] = useState(null); // { fromDay, fromMeal }
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadWeeklyMenu();
  }, []);

  /* Auto-expand today's day */
  useEffect(() => {
    const today = new Date().getDay() || 7;
    setExpandedDay(today);
  }, []);

  const loadWeeklyMenu = async () => {
    try {
      const res = await adminMenuAPI.getWeeklyMenu();
      if (res.success) setWeeklyMenu(res.data);
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (day, meal) => {
    const menu = weeklyMenu[day]?.meals?.[meal];
    setEditingMenu({
      dayOfWeek: day,
      mealType: meal,
      dishes: menu?.dishes ? [...menu.dishes] : [],
    });
    setShowAddDish(false);
    setNewDish({ name: "", category: "Main Course" });
  };

  const handleAddDish = () => {
    if (!newDish.name.trim()) return;
    setEditingMenu((prev) => ({
      ...prev,
      dishes: [
        ...prev.dishes,
        {
          id: `d_${Date.now()}`,
          name: newDish.name.trim(),
          category: newDish.category,
        },
      ],
    }));
    setNewDish({ name: "", category: "Main Course" });
    setShowAddDish(false);
  };

  const handleRemoveDish = (dishId) => {
    setEditingMenu((prev) => ({
      ...prev,
      dishes: prev.dishes.filter((d) => d.id !== dishId),
    }));
  };

  const handleSave = async () => {
    try {
      if (editingMenu.dishes.length === 0) {
        // No dishes left — delete the menu entry instead of upserting empty
        try {
          await adminMenuAPI.deleteMenu(
            editingMenu.dayOfWeek,
            editingMenu.mealType,
          );
        } catch (err) {
          // 404 means it never existed — that's fine, just close
          if (!err?.error?.toLowerCase().includes("not found")) {
            showToast("Failed to clear menu.", "error");
            return;
          }
        }
        await loadWeeklyMenu();
        setEditingMenu(null);
        showToast("Menu cleared.");
      } else {
        const res = await adminMenuAPI.upsertMenu(editingMenu);
        if (res.success) {
          await loadWeeklyMenu();
          setEditingMenu(null);
          showToast("Menu saved successfully!");
        } else {
          showToast("Failed to save menu.", "error");
        }
      }
    } catch {
      showToast("Failed to save menu.", "error");
    }
  };

  const handleCopy = (fromDay, fromMeal) => {
    setCopyTarget({ fromDay, fromMeal });
  };

  const executeCopy = async (toDay) => {
    if (!copyTarget) return;
    try {
      const res = await adminMenuAPI.copyMenu(
        copyTarget.fromDay,
        toDay,
        copyTarget.fromMeal,
      );
      if (res.success) {
        await loadWeeklyMenu();
        showToast(`Copied to ${DAYS.find((d) => d.value === toDay)?.label}!`);
      } else {
        showToast("Copy failed.", "error");
      }
    } catch {
      showToast("Copy failed.", "error");
    } finally {
      setCopyTarget(null);
    }
  };

  const handleDelete = async (day, meal) => {
    if (
      !window.confirm(
        `Delete ${meal} menu for ${DAYS.find((d) => d.value === day)?.label}?`,
      )
    )
      return;
    try {
      const res = await adminMenuAPI.deleteMenu(day, meal);
      if (res.success) {
        await loadWeeklyMenu();
        showToast("Menu deleted.");
      } else showToast("Delete failed.", "error");
    } catch {
      showToast("Delete failed.", "error");
    }
  };

  /* Count dishes for a day */
  const dayDishCount = (dayValue) => {
    const d = weeklyMenu[dayValue];
    if (!d?.meals) return 0;
    return MEALS.reduce((sum, m) => sum + (d.meals[m]?.dishes?.length ?? 0), 0);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Weekly Menu">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Weekly Menu Template">
      <Toast toast={toast} />

      {/* Copy modal */}
      {copyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="admin-card p-6 w-80 animate-scale-in">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Copy Menu
            </h3>
            <p className="text-sm text-neutral-500 mb-5">
              Copy <strong>{copyTarget.fromMeal}</strong> from{" "}
              <strong>
                {DAYS.find((d) => d.value === copyTarget.fromDay)?.label}
              </strong>{" "}
              to:
            </p>
            <div className="space-y-2">
              {DAYS.filter((d) => d.value !== copyTarget.fromDay).map((d) => (
                <button
                  key={d.value}
                  onClick={() => executeCopy(d.value)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                    color: "#404040",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(201,168,76,0.07)";
                    e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fafafa";
                    e.currentTarget.style.borderColor = "#f0f0f0";
                  }}
                >
                  {d.label}
                  <ChevronDown
                    size={14}
                    style={{ transform: "rotate(-90deg)", color: "#c9a84c" }}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => setCopyTarget(null)}
              className="admin-btn-secondary w-full mt-4 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-5 animate-fade-in">
        {/* Info banner */}
        <div
          className="flex items-start gap-3 px-5 py-4 rounded-xl"
          style={{
            background: "rgba(15,23,42,0.04)",
            border: "1px solid rgba(201,168,76,0.18)",
          }}
        >
          <span className="text-lg">📋</span>
          <div>
            <p className="text-sm font-bold text-neutral-800">
              Weekly Template
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Set menus once — they repeat every week automatically. Use Daily
              Override to modify specific days.
            </p>
          </div>
        </div>

        {/* Day accordion */}
        {DAYS.map((day) => {
          const isExpanded = expandedDay === day.value;
          const count = dayDishCount(day.value);
          const isToday = (new Date().getDay() || 7) === day.value;

          return (
            <div key={day.value} className="admin-card overflow-hidden">
              {/* Day header */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 transition-all"
                style={{
                  background: isToday ? "rgba(201,168,76,0.05)" : "white",
                }}
                onClick={() => setExpandedDay(isExpanded ? null : day.value)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={
                      isToday
                        ? {
                            background:
                              "linear-gradient(135deg,#f5c842,#c9a84c)",
                            color: "#0f172a",
                          }
                        : { background: "#f5f5f5", color: "#525252" }
                    }
                  >
                    {day.short}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-neutral-900">
                        {day.label}
                      </span>
                      {isToday && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(201,168,76,0.15)",
                            color: "#9a7a1e",
                          }}
                        >
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">
                      {count > 0
                        ? `${count} dishes across ${MEALS.length} meals`
                        : "No menu set"}
                    </p>
                  </div>
                </div>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200"
                  style={{
                    background: "#f5f5f5",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronDown size={14} className="text-neutral-500" />
                </div>
              </button>

              {/* Expanded meal grid */}
              {isExpanded && (
                <div
                  className="px-6 pb-6 pt-2"
                  style={{ borderTop: "1px solid #f0f0f0" }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    {MEALS.map((meal) => (
                      <MealCell
                        key={meal}
                        day={day.value}
                        meal={meal}
                        menu={weeklyMenu[day.value]?.meals?.[meal]}
                        editingMenu={editingMenu}
                        showAddDish={
                          showAddDish &&
                          editingMenu?.dayOfWeek === day.value &&
                          editingMenu?.mealType === meal
                        }
                        newDish={newDish}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={() => {
                          setEditingMenu(null);
                          setShowAddDish(false);
                        }}
                        onAddDish={handleAddDish}
                        onRemoveDish={handleRemoveDish}
                        onCopy={handleCopy}
                        onDelete={handleDelete}
                        onNewDishChange={setNewDish}
                        onToggleAddForm={setShowAddDish}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default WeeklyMenu;
