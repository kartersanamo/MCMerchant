import type { User } from "@supabase/supabase-js";

/**
 * GoTrue / Supabase error shapes when signUp is called for an existing email.
 * Wording varies by version and server config.
 */
export function isEmailAlreadyRegisteredSignupError(error: {
  message?: string;
  code?: string;
  status?: number;
}): boolean {
  const msg = (error.message ?? "").toLowerCase();
  const code = (error.code ?? "").toLowerCase();

  if (code === "user_already_exists" || code === "email_exists") {
    return true;
  }

  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered") ||
    msg.includes("already registered") ||
    msg.includes("email address is already") ||
    msg.includes("email is already") ||
    msg.includes("user with this email") ||
    msg.includes("an account with this email") ||
    msg.includes("identity already exists")
  ) {
    return true;
  }

  if (msg.includes("duplicate") && (msg.includes("user") || msg.includes("email") || msg.includes("key"))) {
    return true;
  }

  // 422 is commonly used for "already exists" on signUp
  if (error.status === 422 && (msg.includes("registered") || msg.includes("exists") || msg.includes("already"))) {
    return true;
  }

  return false;
}

/**
 * When "prevent leaking account existence" style behavior is on, Supabase may return
 * a user with an empty `identities` array instead of an error. Treat as duplicate email.
 */
export function isSignupObfuscatedExistingEmail(data: { user: User | null }): boolean {
  const u = data.user;
  if (!u?.email) return false;
  const identities = u.identities;
  return Array.isArray(identities) && identities.length === 0;
}
