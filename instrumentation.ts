/**
 * GoTrue logs failed INITIAL_SESSION (e.g. stale refresh_token cookies) with
 * console.error; that is noisy in logs and not actionable. Filter only that
 * specific AuthApiError (dev and production).
 */
export function register() {
  const orig = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (
      first &&
      typeof first === "object" &&
      "name" in first &&
      (first as { name?: string }).name === "AuthApiError" &&
      "code" in first &&
      (first as { code?: string }).code === "refresh_token_not_found"
    ) {
      return;
    }
    if (
      typeof first === "string" &&
      first.includes("AuthApiError") &&
      first.includes("refresh_token_not_found")
    ) {
      return;
    }
    orig(...args);
  };
}
