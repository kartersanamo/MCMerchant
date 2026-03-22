"use client";

import { useState } from "react";

export function StarRatingPicker({
  value,
  onChange,
  disabled,
  size = "md"
}: {
  value: number;
  onChange: (stars: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  const starClass = size === "sm" ? "text-lg leading-none" : "text-2xl leading-none";

  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          className={[
            "rounded p-0.5 transition disabled:opacity-40",
            i <= display ? "text-amber-400" : "text-gray-600",
            starClass
          ].join(" ")}
          onMouseEnter={() => !disabled && setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !disabled && onChange(i)}
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
          aria-pressed={value === i && !hover}
        >
          ★
        </button>
      ))}
    </div>
  );
}
