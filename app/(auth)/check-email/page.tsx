import { Suspense } from "react";
import { CheckEmailClient } from "./check-email-client";

export const metadata = {
  title: "Check your email"
};

function CheckEmailFallback() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-brand-500" />
      <p className="mt-6 text-sm text-gray-400">Loading…</p>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<CheckEmailFallback />}>
      <CheckEmailClient />
    </Suspense>
  );
}
