import { useState } from "react";
import { Trash2 } from "lucide-react";

const WastageSlider = ({ value, onChange }) => {
  const getWastageLevel = (val) => {
    if (val === 0)
      return {
        label: "No Wastage",
        color: "#059669",
        bgColor: "bg-success-50",
      };
    if (val <= 25)
      return { label: "Minimal", color: "#10b981", bgColor: "bg-success-50" };
    if (val <= 50)
      return { label: "Moderate", color: "#f59e0b", bgColor: "bg-warning-50" };
    if (val <= 75)
      return {
        label: "Significant",
        color: "#f97316",
        bgColor: "bg-orange-50",
      };
    return { label: "Complete", color: "#dc2626", bgColor: "bg-error-50" };
  };

  const level = getWastageLevel(value);

  return (
    <div className="mobile-card-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${level.bgColor} rounded-xl`}>
            <Trash2
              size={24}
              style={{ color: level.color }}
              strokeWidth={2.5}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Food Wastage</h3>
            <p
              className="text-sm font-semibold mt-0.5"
              style={{ color: level.color }}
            >
              {level.label}
            </p>
          </div>
        </div>
        <div className={`${level.bgColor} px-4 py-2 rounded-xl`}>
          <span className="text-2xl font-bold" style={{ color: level.color }}>
            {value}%
          </span>
        </div>
      </div>

      <div className="relative pt-2 pb-4">
        <input
          type="range"
          min="0"
          max="100"
          step="25"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${level.color} ${value}%, #e5e5e5 ${value}%)`,
            color: level.color,
          }}
        />
        <div className="flex justify-between mt-3 px-1">
          {[0, 25, 50, 75, 100].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={`text-xs font-semibold px-2 py-1 rounded-lg transition-all active:scale-95 ${
                value === val
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-400 bg-neutral-100"
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-100">
        <p className="text-xs text-neutral-600 text-center">
          {value === 0 && "Great! You finished everything 🎉"}
          {value === 25 && "Most food consumed"}
          {value === 50 && "Half the food wasted"}
          {value === 75 && "Significant wastage"}
          {value === 100 && "All food wasted"}
        </p>
      </div>
    </div>
  );
};

export default WastageSlider;
