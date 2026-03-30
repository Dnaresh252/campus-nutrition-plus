import { Star } from "lucide-react";

const StarRating = ({ rating, onRatingChange, dishName }) => {
  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="star-button transition-transform active:scale-90 focus:outline-none"
          aria-label={`Rate ${dishName} ${star} stars`}
        >
          <Star
            size={36}
            strokeWidth={2}
            className={`transition-all duration-150 ${
              star <= rating
                ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                : "fill-none text-neutral-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
