export function StarRating({
  rating,
  outOf = 5
}: {
  rating: number;
  outOf?: number;
}) {
  const full = Math.max(0, Math.min(outOf, Math.round(rating)));

  return (
    <div className="flex items-center gap-1 text-yellow-400" aria-label={`Rating ${rating} out of ${outOf}`}>
      {Array.from({ length: outOf }).map((_, idx) => {
        const i = idx + 1;
        const isFull = i <= full;
        return (
          <span key={idx} className={isFull ? "opacity-100" : "opacity-20"}>
            {isFull ? "★" : "☆"}
          </span>
        );
      })}
      <span className="ml-1 text-xs text-gray-300">{rating.toFixed(1)}</span>
    </div>
  );
}

