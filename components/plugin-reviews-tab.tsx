"use client";

import { useMemo, useState } from "react";
import { StarRating } from "@/components/star-rating";

export type ReviewItem = {
  id: string;
  buyer_id: string;
  rating: number;
  body: string | null;
  created_at: string | null;
};

type SortKey = "recent" | "highest" | "lowest";

function formatRelativeTime(input: string | null | undefined): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ${min === 1 ? "minute" : "minutes"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ${day === 1 ? "day" : "days"} ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} ${month === 1 ? "month" : "months"} ago`;
  const year = Math.floor(month / 12);
  return `${year} ${year === 1 ? "year" : "years"} ago`;
}

function formatExactDate(input: string | null | undefined): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function getInitials(username: string): string {
  const t = (username ?? "").trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  return t.slice(0, 2).toUpperCase();
}

function RatingBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-16 shrink-0 items-center gap-1 text-sm text-gray-300">
        {star} <span className="text-amber-400/90">★</span>
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-amber-500/80 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-sm text-gray-500">{count}</span>
    </div>
  );
}

export function PluginReviewsTab({
  reviews,
  reviewUsernames,
  ratingAvg,
  pluginSlug
}: {
  reviews: ReviewItem[];
  reviewUsernames: Record<string, string>;
  ratingAvg: number;
  pluginSlug: string;
}) {
  const [sortBy, setSortBy] = useState<SortKey>("recent");

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === "recent") {
      list.sort((a, b) => {
        const ta = new Date(a.created_at ?? 0).getTime();
        const tb = new Date(b.created_at ?? 0).getTime();
        return tb - ta;
      });
    } else if (sortBy === "highest") {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
      list.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
    }
    return list;
  }, [reviews, sortBy]);

  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating ?? 0))));
      counts[star as keyof typeof counts]++;
    });
    return counts;
  }, [reviews]);

  const total = reviews.length;

  if (total === 0) {
    return (
      <div className="mt-5">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/20 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
            <svg
              className="h-8 w-8 text-amber-400/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-100">No reviews yet</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Be the first to share your experience with this plugin. Your review helps other players decide.
          </p>
          <a
            href={`/plugin/${pluginSlug}#reviews`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2.5 text-sm font-medium text-amber-200 ring-1 ring-amber-500/30 transition hover:bg-amber-500/30 hover:text-amber-100"
          >
            <span className="text-amber-400">★</span>
            Write a review
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-6">
      {/* Summary card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
              <span className="text-3xl font-bold tabular-nums text-amber-400">
                {ratingAvg.toFixed(1)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <StarRating rating={ratingAvg} />
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Based on {total} {total === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
          <div className="min-w-0 flex-1 sm:max-w-xs">
            <div className="space-y-2">
              {([5, 4, 3, 2, 1] as const).map((star) => (
                <RatingBar
                  key={star}
                  star={star}
                  count={distribution[star]}
                  total={total}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sort + list */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-gray-200">Community reviews</h3>
          <div className="flex items-center gap-2">
            <label htmlFor="reviews-sort" className="text-xs text-gray-500">
              Sort by
            </label>
            <select
              id="reviews-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-sm text-gray-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              <option value="recent">Most recent</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </select>
          </div>
        </div>

        <ul className="space-y-4">
          {sortedReviews.map((r) => {
            const username = reviewUsernames[r.buyer_id] ?? "Anonymous";
            const initials = getInitials(username);
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-gray-800 bg-gray-900/20 p-5 transition hover:border-gray-700/80"
              >
                <div className="flex gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-gray-300 ring-1 ring-gray-700"
                    aria-hidden
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-gray-100">{username}</span>
                      <div className="flex items-center gap-2">
                        <StarRating rating={Number(r.rating ?? 0)} />
                        <span
                          className="text-xs text-gray-500"
                          title={formatExactDate(r.created_at)}
                        >
                          {formatRelativeTime(r.created_at)}
                        </span>
                      </div>
                    </div>
                    {r.body ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                        {r.body}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm italic text-gray-500">No comment</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
