import { useState } from "react";
import StarRating from "./StarRating";
import { Star } from "lucide-react";

const DishRatingCard = ({ dish, onRatingChange }) => {
  const [rating, setRating] = useState(0);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    onRatingChange(dish.id, newRating);
  };

  return (
    <div className="mobile-card-lg active:scale-[0.99] transition-transform">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-neutral-900 leading-tight">
            {dish.name}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 font-medium">
            {dish.category}
          </p>
        </div>
        {rating > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-lg">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-amber-900">{rating}.0</span>
          </div>
        )}
      </div>

      <StarRating
        rating={rating}
        onRatingChange={handleRatingChange}
        dishName={dish.name}
      />

      {rating > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <p
            className="text-xs text-center font-medium animate-fade-in-mobile"
            style={{
              color:
                rating === 5
                  ? "#059669"
                  : rating === 4
                    ? "#3b82f6"
                    : rating === 3
                      ? "#f59e0b"
                      : rating === 2
                        ? "#f97316"
                        : "#dc2626",
            }}
          >
            {rating === 5 && "🎉 Excellent quality!"}
            {rating === 4 && "👍 Good taste"}
            {rating === 3 && "👌 Average quality"}
            {rating === 2 && "😕 Below expectations"}
            {rating === 1 && "👎 Needs improvement"}
          </p>
        </div>
      )}
    </div>
  );
};

export default DishRatingCard;
