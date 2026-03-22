"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/star-rating";
import { StarRatingPicker } from "@/components/star-rating-picker";
import { MAX_REVIEW_BODY_LENGTH, MAX_SELLER_REPLY_LENGTH } from "@/lib/reviews/constants";

export type ReviewItem = {
  id: string;
  buyer_id: string;
  rating: number;
  body: string | null;
  created_at: string | null;
  updated_at?: string | null;
  seller_reply?: string | null;
  seller_reply_at?: string | null;
  seller_reply_updated_at?: string | null;
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

function EditedBadge({ createdAt, updatedAt }: { createdAt: string | null; updatedAt: string | null | undefined }) {
  if (!updatedAt || !createdAt) return null;
  const c = new Date(createdAt).getTime();
  const u = new Date(updatedAt).getTime();
  if (Number.isNaN(c) || Number.isNaN(u) || u <= c + 60_000) return null;
  return (
    <span className="text-xs text-gray-500" title={formatExactDate(updatedAt)}>
      (edited)
    </span>
  );
}

export function PluginReviewsTab({
  pluginId,
  pluginSlug: _pluginSlug,
  sellerId,
  sellerUsername,
  initialReviews,
  reviewUsernames,
  viewer,
  canPostReview,
  reviewBlockReason
}: {
  pluginId: string;
  pluginSlug: string;
  sellerId: string;
  sellerUsername: string;
  initialReviews: ReviewItem[];
  reviewUsernames: Record<string, string>;
  ratingAvg: number;
  viewer: { userId: string | null; emailVerified: boolean };
  canPostReview: boolean;
  reviewBlockReason: string | null;
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [composerOpen, setComposerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const isSellerViewer =
    Boolean(viewer.userId && viewer.userId === sellerId && viewer.emailVerified);

  const myReview = useMemo(
    () => (viewer.userId ? reviews.find((r) => r.buyer_id === viewer.userId) : undefined),
    [reviews, viewer.userId]
  );

  const ratingAvgLocal = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + Number(r.rating ?? 0), 0) / reviews.length;
  }, [reviews]);

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

  return (
    <div className="mt-5 space-y-6">
      {/* Write review */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-gray-200">Your review</h3>
            <p className="mt-1 text-xs text-gray-500">
              {canPostReview
                ? myReview
                  ? "You can edit or delete your review anytime."
                  : "Share a star rating and optional feedback."
                : reviewBlockReason ?? "You can’t post a review right now."}
            </p>
          </div>
          {canPostReview && !myReview ? (
            <button
              type="button"
              onClick={() => {
                setComposerOpen((o) => !o);
                setFormError(null);
              }}
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-200 hover:bg-amber-500/20"
            >
              {composerOpen ? "Cancel" : "Write a review"}
            </button>
          ) : null}
        </div>

        {canPostReview && !myReview && composerOpen ? (
          <ReviewComposerForm
            pluginId={pluginId}
            busy={busy}
            formError={formError}
            onSubmit={async (rating, body) => {
              setBusy(true);
              setFormError(null);
              const res = await fetch(`/api/v1/plugins/${pluginId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, body })
              });
              const data = await res.json().catch(() => null);
              setBusy(false);
              if (!res.ok) {
                setFormError(typeof data?.error === "string" ? data.error : "Could not save review.");
                return;
              }
              if (data?.review) {
                setReviews((prev) => [data.review as ReviewItem, ...prev]);
              }
              setComposerOpen(false);
              router.refresh();
            }}
          />
        ) : null}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/20 px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
            <span className="text-3xl text-amber-400/70">★</span>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-100">No reviews yet</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Be the first to share your experience with this plugin.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
                  <span className="text-3xl font-bold tabular-nums text-amber-400">
                    {ratingAvgLocal.toFixed(1)}
                  </span>
                </div>
                <div>
                  <StarRating rating={ratingAvgLocal} />
                  <p className="mt-1 text-sm text-gray-400">
                    Based on {total} {total === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <div className="space-y-2">
                  {([5, 4, 3, 2, 1] as const).map((star) => (
                    <RatingBar key={star} star={star} count={distribution[star]} total={total} />
                  ))}
                </div>
              </div>
            </div>
          </div>

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
              {sortedReviews.map((r) => (
                <ReviewRow
                  key={r.id}
                  review={r}
                  username={reviewUsernames[r.buyer_id] ?? "Anonymous"}
                  pluginId={pluginId}
                  sellerUsername={sellerUsername}
                  isOwner={viewer.userId === r.buyer_id}
                  isSellerViewer={isSellerViewer}
                  onUpdated={(row) => {
                    setReviews((prev) => prev.map((x) => (x.id === row.id ? row : x)));
                    router.refresh();
                  }}
                  onDeleted={(id) => {
                    setReviews((prev) => prev.filter((x) => x.id !== id));
                    router.refresh();
                  }}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function ReviewComposerForm({
  pluginId,
  busy,
  formError,
  onSubmit
}: {
  pluginId: string;
  busy: boolean;
  formError: string | null;
  onSubmit: (rating: number, body: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");

  return (
    <div className="mt-4 space-y-4 border-t border-gray-800 pt-4">
      <div>
        <div className="text-xs font-medium text-gray-400">Rating</div>
        <div className="mt-2">
          <StarRatingPicker value={rating} onChange={setRating} disabled={busy} />
        </div>
      </div>
      <div>
        <label htmlFor={`review-body-${pluginId}`} className="text-xs font-medium text-gray-400">
          Review (optional)
        </label>
        <textarea
          id={`review-body-${pluginId}`}
          value={body}
          disabled={busy}
          maxLength={MAX_REVIEW_BODY_LENGTH}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="What did you like? What could be better?"
          className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-amber-500/40 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
        />
        <div className="mt-1 text-right text-xs text-gray-600">
          {body.length}/{MAX_REVIEW_BODY_LENGTH}
        </div>
      </div>
      {formError ? (
        <p className="text-sm text-red-400" role="alert">
          {formError}
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => onSubmit(rating, body)}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 disabled:opacity-50"
      >
        {busy ? "Posting…" : "Post review"}
      </button>
    </div>
  );
}

function ReviewRow({
  review: r,
  username,
  pluginId,
  sellerUsername,
  isOwner,
  isSellerViewer,
  onUpdated,
  onDeleted
}: {
  review: ReviewItem;
  username: string;
  pluginId: string;
  sellerUsername: string;
  isOwner: boolean;
  isSellerViewer: boolean;
  onUpdated: (row: ReviewItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [editRating, setEditRating] = useState(r.rating);
  const [editBody, setEditBody] = useState(r.body ?? "");
  const [replyText, setReplyText] = useState(r.seller_reply ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setEditRating(r.rating);
    setEditBody(r.body ?? "");
    setReplyText(r.seller_reply ?? "");
  }, [r.rating, r.body, r.seller_reply]);

  const initials = getInitials(username);

  async function saveEdit() {
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/v1/plugins/${pluginId}/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: editRating, body: editBody })
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setErr(typeof data?.error === "string" ? data.error : "Update failed.");
      return;
    }
    if (data?.review) {
      onUpdated(data.review as ReviewItem);
      setEditing(false);
    }
  }

  async function removeReview() {
    if (!confirm("Delete your review permanently?")) return;
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/v1/plugins/${pluginId}/reviews/${r.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setErr(typeof data?.error === "string" ? data.error : "Delete failed.");
      return;
    }
    onDeleted(r.id);
  }

  async function submitReply(method: "POST" | "PATCH") {
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/v1/plugins/${pluginId}/reviews/${r.id}/seller-reply`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyText })
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setErr(typeof data?.error === "string" ? data.error : "Could not save reply.");
      return;
    }
    if (data?.review) {
      onUpdated(data.review as ReviewItem);
      setReplyOpen(false);
    }
  }

  async function deleteReply() {
    if (!confirm("Remove your public reply?")) return;
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/v1/plugins/${pluginId}/reviews/${r.id}/seller-reply`, {
      method: "DELETE"
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setErr(typeof data?.error === "string" ? data.error : "Could not remove reply.");
      return;
    }
    onUpdated({
      ...r,
      seller_reply: null,
      seller_reply_at: null,
      seller_reply_updated_at: null
    });
    setReplyOpen(false);
  }

  return (
    <li className="rounded-2xl border border-gray-800 bg-gray-900/20 p-5 transition hover:border-gray-700/80">
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
            <div className="flex flex-wrap items-center gap-2">
              {editing ? (
                <StarRatingPicker value={editRating} onChange={setEditRating} disabled={busy} size="sm" />
              ) : (
                <StarRating rating={Number(r.rating ?? 0)} />
              )}
              <span className="text-xs text-gray-500" title={formatExactDate(r.created_at)}>
                {formatRelativeTime(r.created_at)}
              </span>
              <EditedBadge createdAt={r.created_at} updatedAt={r.updated_at} />
            </div>
          </div>

          {editing ? (
            <div className="mt-3 space-y-3">
              <textarea
                value={editBody}
                disabled={busy}
                maxLength={MAX_REVIEW_BODY_LENGTH}
                onChange={(e) => setEditBody(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-200 focus:border-amber-500/40 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={saveEdit}
                  className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-gray-950 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEditing(false);
                    setEditRating(r.rating);
                    setEditBody(r.body ?? "");
                    setErr(null);
                  }}
                  className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {r.body ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{r.body}</p>
              ) : (
                <p className="mt-2 text-sm italic text-gray-500">No written comment</p>
              )}
            </>
          )}

          {isOwner && !editing ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(true)}
                className="text-xs font-medium text-brand-400 hover:underline disabled:opacity-50"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={removeReview}
                className="text-xs font-medium text-red-400/90 hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          ) : null}

          {err ? (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {err}
            </p>
          ) : null}

          {/* Seller reply */}
          {r.seller_reply && !replyOpen ? (
            <div className="mt-4 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-400/90">
                  Response from {sellerUsername}
                </span>
                <span className="text-xs text-gray-500" title={formatExactDate(r.seller_reply_at)}>
                  {formatRelativeTime(r.seller_reply_at)}
                  {r.seller_reply_updated_at &&
                  r.seller_reply_at &&
                  new Date(r.seller_reply_updated_at).getTime() >
                    new Date(r.seller_reply_at).getTime() + 60_000 ? (
                    <span className="ml-1 text-gray-600">(edited)</span>
                  ) : null}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-200">{r.seller_reply}</p>
              {isSellerViewer ? (
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setReplyOpen(true)}
                    className="text-xs font-medium text-brand-400 hover:underline"
                  >
                    Edit reply
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={deleteReply}
                    className="text-xs font-medium text-red-400/90 hover:underline"
                  >
                    Delete reply
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {isSellerViewer && !r.seller_reply && !replyOpen ? (
            <div className="mt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => setReplyOpen(true)}
                className="text-xs font-medium text-brand-400 hover:underline"
              >
                Reply as seller
              </button>
            </div>
          ) : null}

          {isSellerViewer && replyOpen ? (
            <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950/50 p-4">
              <label className="text-xs font-medium text-gray-400">
                {r.seller_reply ? "Edit your reply" : "Public reply"}
              </label>
              <textarea
                value={replyText}
                disabled={busy}
                maxLength={MAX_SELLER_REPLY_LENGTH}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                placeholder="Thank the reviewer or address their feedback…"
                className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-200"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => submitReply(r.seller_reply ? "PATCH" : "POST")}
                  className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-gray-950 disabled:opacity-50"
                >
                  {busy ? "Saving…" : r.seller_reply ? "Update reply" : "Post reply"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setReplyOpen(false);
                    setReplyText(r.seller_reply ?? "");
                    setErr(null);
                  }}
                  className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </li>
  );
}
