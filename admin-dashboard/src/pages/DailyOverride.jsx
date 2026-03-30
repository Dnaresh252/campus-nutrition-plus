import { useState, useEffect } from "react";
import {
  AlertCircle,
  Plus,
  X,
  RotateCcw,
  Save,
  ChevronRight,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { adminMenuAPI } from "../utils/adminApi";
import { format } from "date-fns";

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

const MEAL_ICONS = {
  BREAKFAST: "🌅",
  LUNCH: "☀️",
  SNACKS: "🍎",
  DINNER: "🌙",
};

const DailyOverride = () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const dayOfWeek = new Date().getDay() || 7;

  const [selectedMeal, setSelectedMeal] = useState("LUNCH");
  const [templateMenu, setTemplateMenu] = useState([]);
  const [removedDishes, setRemovedDishes] = useState([]);
  const [addedDishes, setAddedDishes] = useState([]);
  const [newDish, setNewDish] = useState({ name: "", category: "Main Course" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadMenu();
  }, [selectedMeal]);

  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const [menuRes, overrideRes] = await Promise.all([
        adminMenuAPI.getMenu(dayOfWeek, selectedMeal),
        adminMenuAPI.getDailyOverride(today),
      ]);

      setTemplateMenu(menuRes.success ? menuRes.data.dishes || [] : []);

      if (overrideRes.success) {
        const override = overrideRes.data.find(
          (o) => o.meal_type === selectedMeal,
        );
        setRemovedDishes(override?.removed_dishes || []);
        setAddedDishes(override?.added_dishes || []);
      } else {
        setRemovedDishes([]);
        setAddedDishes([]);
      }
    } catch {
      setTemplateMenu([]);
      setRemovedDishes([]);
      setAddedDishes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRemove = (dishId) => {
    setRemovedDishes((prev) =>
      prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId],
    );
  };

  const handleAddDish = () => {
    if (!newDish.name.trim()) return;
    setAddedDishes((prev) => [
      ...prev,
      {
        id: `added_${Date.now()}`,
        name: newDish.name.trim(),
        category: newDish.category,
      },
    ]);
    setNewDish({ name: "", category: "Main Course" });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await adminMenuAPI.addDailyOverride({
        date: today,
        mealType: selectedMeal,
        removedDishes,
        addedDishes,
      });
      if (res.success) showToast("Override saved successfully!");
      else showToast("Failed to save. Try again.", "error");
    } catch {
      showToast("Failed to save override.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Reset ${selectedMeal} to template menu?`)) return;
    try {
      await adminMenuAPI.removeDailyOverride(today, selectedMeal);
      setRemovedDishes([]);
      setAddedDishes([]);
      showToast("Reset to template menu.");
    } catch {
      setRemovedDishes([]);
      setAddedDishes([]);
      showToast("Reset to template menu.");
    }
  };

  const finalMenu = [
    ...templateMenu.filter((d) => !removedDishes.includes(d.id)),
    ...addedDishes,
  ];

  const hasChanges = removedDishes.length > 0 || addedDishes.length > 0;

  return (
    <AdminLayout title="Daily Override">
      <div className="space-y-6 animate-fade-in">
        {/* ── Toast ── */}
        {toast && (
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
            {toast.type === "error" ? (
              <AlertCircle size={16} />
            ) : (
              <span className="text-gold-400" style={{ color: "#c9a84c" }}>
                ✓
              </span>
            )}
            <span className="text-sm font-semibold">{toast.msg}</span>
          </div>
        )}

        {/* ── Info Banner ── */}
        <div
          className="flex items-start gap-3 px-5 py-4 rounded-xl"
          style={{
            background: "rgba(201,168,76,0.07)",
            border: "1px solid rgba(201,168,76,0.20)",
          }}
        >
          <AlertCircle
            size={18}
            className="flex-shrink-0 mt-0.5"
            style={{ color: "#c9a84c" }}
          />
          <div>
            <p className="text-sm font-bold" style={{ color: "#9a7a1e" }}>
              Today's Modifications Only
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#b8962e" }}>
              Changes apply to{" "}
              <strong>{format(new Date(), "EEEE, MMMM d")}</strong> only.
              Tomorrow reverts to the weekly template automatically.
            </p>
          </div>
        </div>

        {/* ── Meal Selector ── */}
        <div className="admin-card p-5">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Select Meal
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MEALS.map((meal) => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200"
                style={
                  selectedMeal === meal
                    ? {
                        background: "linear-gradient(135deg,#1e2a8a,#0f172a)",
                        color: "white",
                        boxShadow: "0 4px 14px rgba(15,23,42,0.25)",
                      }
                    : {
                        background: "#f5f5f5",
                        color: "#525252",
                        border: "1px solid #e5e5e5",
                      }
                }
              >
                <span>{MEAL_ICONS[meal]}</span>
                <span>{meal.charAt(0) + meal.slice(1).toLowerCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Menu */}
            <div className="admin-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-neutral-900">
                  Template Menu
                </h3>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(15,23,42,0.06)",
                    color: "#1e2a8a",
                  }}
                >
                  {templateMenu.length} dishes
                </span>
              </div>

              {templateMenu.length > 0 ? (
                <div className="space-y-2">
                  {templateMenu.map((dish) => {
                    const removed = removedDishes.includes(dish.id);
                    return (
                      <div
                        key={dish.id}
                        className="flex items-center justify-between p-3 rounded-xl transition-all"
                        style={
                          removed
                            ? {
                                background: "rgba(225,29,72,0.05)",
                                border: "1px solid rgba(225,29,72,0.15)",
                              }
                            : {
                                background: "#fafafa",
                                border: "1px solid #f0f0f0",
                              }
                        }
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold ${removed ? "line-through text-neutral-400" : "text-neutral-900"}`}
                          >
                            {dish.name}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {dish.category}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleRemove(dish.id)}
                          className="ml-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0"
                          style={
                            removed
                              ? {
                                  background: "rgba(16,185,129,0.10)",
                                  color: "#047857",
                                }
                              : {
                                  background: "rgba(225,29,72,0.08)",
                                  color: "#e11d48",
                                }
                          }
                        >
                          {removed ? "Restore" : "Remove"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-400 text-sm">
                    No template menu set for this meal.
                  </p>
                  <p className="text-neutral-300 text-xs mt-1">
                    Set it up in Weekly Menu first.
                  </p>
                </div>
              )}
            </div>

            {/* Add Special Dishes */}
            <div className="admin-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-neutral-900">
                  Add Special Dishes
                </h3>
                {addedDishes.length > 0 && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(201,168,76,0.10)",
                      color: "#9a7a1e",
                    }}
                  >
                    {addedDishes.length} added
                  </span>
                )}
              </div>

              {/* Added dishes list */}
              {addedDishes.length > 0 && (
                <div className="space-y-2 mb-4">
                  {addedDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: "rgba(16,185,129,0.05)",
                        border: "1px solid rgba(16,185,129,0.15)",
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {dish.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {dish.category}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setAddedDishes((prev) =>
                            prev.filter((d) => d.id !== dish.id),
                          )
                        }
                        className="p-1.5 rounded-lg transition-all ml-2"
                        style={{
                          background: "rgba(225,29,72,0.08)",
                          color: "#e11d48",
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add form */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}
              >
                <div>
                  <label className="admin-label">Dish Name</label>
                  <input
                    type="text"
                    value={newDish.name}
                    onChange={(e) =>
                      setNewDish({ ...newDish, name: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleAddDish()}
                    placeholder="e.g. Paneer Butter Masala"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <select
                    value={newDish.category}
                    onChange={(e) =>
                      setNewDish({ ...newDish, category: e.target.value })
                    }
                    className="admin-input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddDish}
                  disabled={!newDish.name.trim()}
                  className="admin-btn-primary w-full py-2.5"
                >
                  <Plus size={16} />
                  Add Dish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Final Preview ── */}
        {!isLoading && (
          <div className="admin-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Final Menu Preview
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  What students will see today
                </p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(15,23,42,0.06)", color: "#1e2a8a" }}
              >
                {finalMenu.length} dishes
              </span>
            </div>

            {finalMenu.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {finalMenu.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-3 rounded-xl"
                    style={{
                      background: addedDishes.find((d) => d.id === dish.id)
                        ? "rgba(201,168,76,0.07)"
                        : "#fafafa",
                      border: addedDishes.find((d) => d.id === dish.id)
                        ? "1px solid rgba(201,168,76,0.20)"
                        : "1px solid #f0f0f0",
                    }}
                  >
                    <p className="text-sm font-semibold text-neutral-900">
                      {dish.name}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {dish.category}
                    </p>
                    {addedDishes.find((d) => d.id === dish.id) && (
                      <span
                        className="text-xs font-bold mt-1.5 inline-block"
                        style={{ color: "#c9a84c" }}
                      >
                        + Special
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-400 text-sm">
                  No dishes in final menu
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        {!isLoading && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="admin-btn-primary px-6 py-3"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Override
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="admin-btn-secondary px-6 py-3"
            >
              <RotateCcw size={16} />
              Reset to Template
            </button>
            {hasChanges && (
              <span className="text-xs text-neutral-400 font-medium">
                {removedDishes.length > 0 && `${removedDishes.length} removed`}
                {removedDishes.length > 0 && addedDishes.length > 0 && " · "}
                {addedDishes.length > 0 && `${addedDishes.length} added`}
              </span>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DailyOverride;
