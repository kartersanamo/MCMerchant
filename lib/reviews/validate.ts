import { MAX_REVIEW_BODY_LENGTH, MAX_SELLER_REPLY_LENGTH } from "./constants";

export function parseRating(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

export function parseReviewBody(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: true, value: "" };
  if (typeof raw !== "string") return { ok: false, error: "Review text must be a string." };
  const t = raw.trim();
  if (t.length > MAX_REVIEW_BODY_LENGTH) {
    return { ok: false, error: `Review must be at most ${MAX_REVIEW_BODY_LENGTH} characters.` };
  }
  return { ok: true, value: t };
}

export function parseSellerReply(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: false, error: "Reply text is required." };
  if (typeof raw !== "string") return { ok: false, error: "Reply must be a string." };
  const t = raw.trim();
  if (!t.length) return { ok: false, error: "Reply text is required." };
  if (t.length > MAX_SELLER_REPLY_LENGTH) {
    return { ok: false, error: `Reply must be at most ${MAX_SELLER_REPLY_LENGTH} characters.` };
  }
  return { ok: true, value: t };
}
